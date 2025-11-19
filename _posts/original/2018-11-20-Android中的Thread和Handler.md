---
layout: post
categories: original
title: "Android 中的 Thread 和 Handler"
author: 立泉
mention: Looper MessageQueue ANR
date: 2018-11-20 +0800
description: 其实很长一段时间我并不知道 Handler 是如何工作的，接触 RxJava 之前切换线程只是 handler.post(() -> {})，但随着项目更迭我需要知道关键组件的执行原理，不然无法为代码质量负责。
cover: 
tags: Code Android Thread Handler SourceCode
---

其实很长一段时间我并不知道`Handler`是如何工作的，接触 RxJava 之前切换线程只是`handler.post(() -> {})`，但随着项目更迭我需要知道关键组件的执行原理，不然无法为代码质量负责。

习惯在 OneNote 中记录学习和工作笔记，这些文本容量已经累积到 57MB，是时候停下来整理一遍更精细的填充技术栈。这篇文章是一个开始，能描述清楚一个组件才意味着真正理解它。

## Main Thread

Android 的 Thread 即是 Java 线程，系统会为启动的 App 创建一个 Linux Process 和一个 Execution Thread，默认此 App 的所有组件都会运行在这个进程的单一执行线程中，包括 UI 触控事件的分发处理，所以此线程又被称为 UI Thread 或 Main Thread。

## Called from wrong thread

> Only the original thread that created a view hierarchy can touch its views.

为性能考虑，Android 的 UI 操作是线程不安全的，即多线程操作 UI 可能出现状态不一致的情况，所以 Android 强制要求只能在主线程操作 UI，否则抛出`CalledFromWrongThreadException`异常。

```kotlin
override onCreate(savedInstanceState: Bundle?) {
    ...
    // 主线程操作 UI
    tvShow.text = "UI Thread"
    // 抛出的 Runnable 会在 View Tree 完成后执行
    tvShow.post {
        Thread {
            // 非主线程操作 UI 会抛出 CalledFromWrongThreadException
            tvShow.text = "Other Thread"
        }.start()
    }
}
```

## ANR

ANR 即 Application Not Responding，应用程序无响应。Android 作为手持设备通过 UI 触控与用户交互，产生的触控事件会在主线程进行由`Activity`到`View`的层层分发，交给对应组件处理后刷新 UI，这个过程的迅速完成会让用户感觉到操作顺滑。

如果负责分发事件的主线程被阻塞（通常是因为在主线程执行耗时操作），则用户点击屏幕后触控事件迟迟不能向下传递，处理组件无法获取事件给出反馈，用户看到的是点击屏幕却无反应，App 像卡住一样。当阻塞时间大于 5 秒，Android 就会弹出 ANR 提醒用户强制关闭程序。

所以在 Android 中使用线程必须遵循 2 条规则：

* 只在主线程操作 UI
* 不能阻塞主线程

## 什么是 Handler

已知 Android 需要在工作线程执行耗时操作再切换到主线程刷新 UI，这个切换线程的动作即可使用`Handler`实现，而且它其实能将任意线程中的`Message`或`Runnable`发送到任意线程中处理。

```kotlin
// 创建处理 Runnable 的 Handler
val handler = Handler()
override fun onCreate(savedInstanceState: Bundle?) {
    ...
    Thread {
        // 在工作线程执行耗时操作
        doSth()
        // 切换到主线程刷新 UI
        handler.post {
            Toast.makeText(this, "Work done", Toast.LENGTH_SHORT).show()
        }
        // View 的 post() 内部实现其实也是 Handler
        view.post {
            Toast.makeText(this, "Post from view", Toast.LENGTH_SHORT).show()
        }
    }.start()
}
```

理解`Handler`如何将`Runnable`或`Message`发送到另一个线程需要注意`Looper`、`MessageQueue`和`ThreadLocal`，从创建`Handler`说起：

```java
// 创建 Handler 实际使用的构造器
public Handler(Callback callback, boolean async) {
    // 获取 Looper
    mLooper = Looper.myLooper();
    if (mLooper == null) {
        throw new RuntimeException(
            "Can't create handler inside thread " + Thread.currentThread()
            + " that has not called Looper.prepare()");
        }
    // 获取 Looper 的 MessageQueue
    mQueue = mLooper.mQueue;
    mCallback = callback;
    mAsynchronous = async;
}
```

创建`Handler`会尝试获取一个`Looper`和它的`MessageQueue`，获取不到则抛异常。

获取的是什么`Looper`呢，继续看：

```java
// Looper.myLooper() 方法实现
public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
    }
```

了解`ThreadLocal`就知道，它获取的是此线程私有的`Looper`，即这个`Looper`是和此线程绑定的。

那么这个`Looper`有什么作用呢，看一下`Handler.post(Runnable)`的实现：

```java
public final boolean post(Runnable r) {
    // 将 Runnable 封装成 Message，继续传递
   return  sendMessageDelayed(getPostMessage(r), 0);
}
```

最终调用：

```java
public boolean sendMessageAtTime(Message msg, long uptimeMillis) {
    // 从 Looper 中获取的 MessageQueue
    MessageQueue queue = mQueue;
    if (queue == null) {
        RuntimeException e = new RuntimeException(
                this + " sendMessageAtTime() called with no mQueue");
        Log.w("Looper", e.getMessage(), e);
        return false;
    }
    // 将 Runnable 封装的 Message 添加到一个 Handler 持有的 MessageQueue 中，即从 Looper 获取的 Queue
    return enqueueMessage(queue, msg, uptimeMillis);
}
private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
        // 将该 Handler 实例保存到 Message 中
        msg.target = this;
        if (mAsynchronous) {
            msg.setAsynchronous(true);
        }
        return queue.enqueueMessage(msg, uptimeMillis);
    }
```

可以看到，切换线程使用的`Handler.post(Runnable)`实际上只是把`Runnable`封装成`Message`，并添加到一个该`Handler`从`Looper`那里获取的`MessageQueue`中，那么是谁来从`Queue`中取出`Message`并处理呢？

答案就是`Looper`，看 2 个`Looper`的关键方法：

```java
// Looper.prepare()
private static void prepare(boolean quitAllowed) {
    // 检查该线程是否已经创建过 Looper，一个线程只允许创建一个 Looper
    if (sThreadLocal.get() != null) {
        throw new RuntimeException("Only one Looper may be created per thread");
    }
    // 创建该线程私有的 Looper
    sThreadLocal.set(new Looper(quitAllowed));
}
// Looper 的构造器
private Looper(boolean quitAllowed) {
    // 创建 MessageQueue
    mQueue = new MessageQueue(quitAllowed);
    mThread = Thread.currentThread();
}
```

`Looper.prepare()`会检查当前线程是否已经创建过`Looper`，没有的话就创建一个新并设置为该线程私有，留心的话，其实`Handler`构造时从线程获取的`Looper`就是在这里创建的。`Looper`构造时会在内部创建一个`MessageQueue`，即是`Handler.post(Runnable)`用到的那个`Queue`。

```java
// Looper.loop()，这里只取关键逻辑，完整逻辑请看源码
public static void loop() {
    // 确保已经执行过 Looper.prepare()
    final Looper me = myLooper();
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    // 获取 Looper 的 MessageQueue
    final MessageQueue queue = me.mQueue;
    // 进入阻塞线程的无限循环
    for (;;) {
        Message msg = queue.next(); // might block
        try {
            // 取出 Message 中保存的 Handler 实例，即发送该 Message 的 Handler，调用它的相关方法处理这个 Message
            msg.target.dispatchMessage(msg);
            dispatchEnd = needEndTime ? SystemClock.uptimeMillis() : 0;
        } finally {
            if (traceTag != 0) {
                Trace.traceEnd(traceTag);
            }
        }
    }
}
```

`Looper.loop()`会进入无限的等待循环，不断检查`MessageQueue`中是否有新`Message`，一旦获得就取出其在`post()`时保存的`Handler`实例，调用它的方法处理`Message`，这就是`Handler.post(Runnable)`的执行轨迹。

至于最关键的线程切换如何实现，需注意`Looper.prepare()`所在的线程，它就是`Runnable`事件被处理时的线程，和线程启用`Looper`有关。

前面提到`Handler`创建时要求线程必须有`Looper`，即执行过`Looper.prepare()`，一般这样创建支持`Looper`的线程：

```kotlin
class CusThread : Thread() {
    lateinit var handler: Handler
    override fun run() {
        Looper.prepare()
        handler = Handler()
        // 阻塞线程，等待处理 Handler 分发的事件
        Looper.loop()
    }
}
```

实际这个线程在创建`Handler`之后就因为执行`Looper.loop()`而阻塞，处于监听`MessageQueue`等待`Handler`分发事件的状态。注意`Looper.loop()`是在该线程中执行，结合之前的源码，通过`Handler`发送的`Runnable`都会在此线程中执行，而`Handler.post(Runnable)`这个行为可在任意线程中进行，所以能实现在其它线程发送事件到指定线程处理，即广义的切换线程。

使用`CusThread`示例：

```kotlin
val thread = CusThread()
thread.start()
...
// 在其它线程中发送事件到 CusThread 线程中处理
Thread {
    thread.handler.post {
        // 这里的代码会在 CusThread 中执行
    }
}.start()
// 必要时退出 Looper.loop() 引起的线程阻塞，结束该执行线程
thread.handler.looper.quite()
```

## 使用 HandlerThread

普通线程需创建`Looper`才可使用`Handler`，Android 提供一个默认创建好`Looper`的线程`HandlerThread`，原理和上面`CusThread`大同小异，只是多些细节控制，可这样使用它：

```kotlin
val handlerThread = HandlerThread("")
handlerThread.start()
// 创建 Handler 时传入指定的 Looper，这样它就不会去获取创建线程的 Looper
val handler = Handler(handlerThread.looper)
...
// 在其它线程中发送事件到 CusThread 线程处理
Thread {
    handler.post {
        // 这里的代码会在 HandlerThread 执行
    }
}.start()
// 必要时退出 Looper.loop() 引起的线程阻塞，结束该执行线程
handler.looper.quite()
```

## 总结

`Handler`机制总结起来大概是这样：`Handler`创建时需要一个`Looper`，可以是指定的`Looper`或使用当前线程的`Looper`。`Handler`获取此`Looper`的`MessageQueue`，当`Handler.post(Runnable)`执行时，`Handler`把`Runnable`封装成`Message`并携带该`Handler`实例，发送到从`Looper`拿到的`MessageQueue`中。`Looper`在其创建线程中不断检查`MessageQueue`是否有新`Message`，有即取出，调用附带的`Handler`方法处理，因为`Handler`发送事件的线程和`Looper`执行事件的线程一般不同，即实现线程切换。

## Main Thread 的特殊性

可能已经注意到，既然创建`Handler`时要求该线程必须有`Looper`否则抛出异常，那么 Android 主线程为什么能直接创建`Handler`呢？

其实，能创建即说明这个主线程默认已经有`Looper`，Android 实际由事件驱动，主线程相当于一直在“阻塞”（即`Looper.loop()`），它在等待新事件，所谓“不能阻塞主线程”实际是指不能阻塞主线程的事件处理。体会一下区别，很有意思。