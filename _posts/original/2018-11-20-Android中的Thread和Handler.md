---
layout: post
type: original
categories: original
title: "Android中的Thread和Handler"
author: 立泉
date: 2018-11-20 +0800
description: 
cover: 
tags: CS Android
---

其实，在很长一段时间里，我并不了解`Handler`究竟是如何工作的，接触`RxJava`之前，需要切换线程时，我只是简单的`post(Runnable)`，但随着所做项目的不断迭代优化，我需要知道自己用到的关键组件的执行原理，不然便无法为代码质量负责。

之前在学习和工作中，我都会将笔记写在`OneNote`上，这些文本容量目前已经达到了57M，我觉得，是时候停下来，好好把它们分类整理，来更精细地填充我的技术栈。所以这篇文章只是一个开始，如果我能把一个东西写清楚，那么可以说，我才真正理解了它。

# Android中的Thread

## Main Thread

对`Android`来说，`Thread`即`Java`线程，当一个APP的组件启动时，`Android`系统会为它创建一个`Linux Process`和一个`Execution Thread`，默认情况下，此APP的所有组件都会运行在这个进程的单一执行线程中，包括UI上产生的各种触控交互事件的分发，所以此线程又被称为`UI Thread`和`Main Thread`。

## CalledFromWrongThreadException

> Only the original thread that created a view hierarchy can touch its views

`Android`的UI操作是线程不安全的，这意味着多线程操作UI时可能会出现状态不一致的情况，所以`Android`强制要求必须在主线程中操作UI，否则就会抛出一个名为`CalledFromWrongThreadException`的异常。

```kotlin
override onCreate(savedInstanceState: Bundle?) {
    ...
    // 主线程中操作UI
    tvShow.text = "UI Thread"
    // 当View Tree完成后执行
    tvShow.post {
        Thread {
            // 其它线程中操作UI，抛出CalledFromWrongThreadException
            tvShow.text = "Other Thread"
        }.start()
    }
}
```

## ANR

`ANR`即`Application Not Responding`，应用程序无响应，`Android`作为手持设备，是通过UI的触摸与用户交互的，这些触控事件一旦产生，都会在主线程中进行由`Activity`到`View`的层层分发，交给对应的处理代码，并在处理完成后及时刷新UI，这样用户才会感到操作流畅、不卡顿。如果负责分发事件的主线程被阻塞（通常是在主线程中执行耗时操作），则用户点击屏幕后，这些触控事件迟迟不能向下传递，事件处理者就无法获取事件并给出反馈，用户看到的就是，点击了屏幕，无任何反应，APP就像卡住了一样。通常，如果阻塞时间大于5秒，`Android`系统就会弹出`ANR`，提醒用户强制关闭程序。

总的来说，在`Android`中使用线程，必须遵循以下2条规则：

* 必须在主线程中操作UI
* 不能阻塞主线程

# 什么是Handler

已经知道，`Android`需要在工作线程中执行耗时操作，然后切换到主线程刷新UI，这个切换线程的动作就可以使用`Handler`实现。实际上，`Handler`可以将任意线程中的`Message`或`Runnable`发送到任意指定的线程中处理。

```kotlin
// 创建处理Runnable的Handler
val handler = Handler()
override fun onCreate(savedInstanceState: Bundle?) {
    ...
    Thread {
        // 在工作线程中执行耗时操作
        doSth()
        // 切换到主线程中刷新UI
        handler.post {
            Toast.makeText(this, "Work done", Toast.LENGTH_SHORT).show()
        }
        // view的post的内部实现其实也是Handler
        view.post {
            Toast.makeText(this, "Post from view", Toast.LENGTH_SHORT).show()
        }
    }.start()
}
```

要理解`Handler`是如何将`Runnable`或`Message`发送到另一个线程中的，需要注意`Looper`、`MessageQueue`和`ThreadLocal`，从创建`Handler`的那一刻说起：

```java
// 创建Handler时，实际使用的构造器
public Handler(Callback callback, boolean async) {
    // 获取Looper
    mLooper = Looper.myLooper();
    if (mLooper == null) {
        throw new RuntimeException(
            "Can't create handler inside thread " + Thread.currentThread()
            + " that has not called Looper.prepare()");
        }
    // 获取Looper的MessageQueue
    mQueue = mLooper.mQueue;
    mCallback = callback;
    mAsynchronous = async;
}
```

在创建`Handler`时，它会去获取一个`Looper`，并且获取这个`Looper`的`MessageQueue`，如果获取不到，就会直接抛出异常。那么它要获取的是什么`Looper`呢，继续看：

```java
// Looper.myLooper()方法实现
public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
    }
```

了解`ThreadLocal`就知道，它获取的是此线程私有的`Looper`，即这个`Looper`是和此线程绑定的，那么这个`Looper`有什么作用呢？看一下`Handler.post(Runnable)`的实现：

```java
public final boolean post(Runnable r) {
    // 将Runnable封装成Message，继续传递
   return  sendMessageDelayed(getPostMessage(r), 0);
}
```

最终调用的是这个：

```java
public boolean sendMessageAtTime(Message msg, long uptimeMillis) {
    // 从Looper中获取的MessageQueue
    MessageQueue queue = mQueue;
    if (queue == null) {
        RuntimeException e = new RuntimeException(
                this + " sendMessageAtTime() called with no mQueue");
        Log.w("Looper", e.getMessage(), e);
        return false;
    }
    // 将Runnable封装的Message，添加到一个Handler持有的MessageQueue中，即从Looper那里获取的Queue
    return enqueueMessage(queue, msg, uptimeMillis);
}
private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
        // 将该Handler实例保存到Message中
        msg.target = this;
        if (mAsynchronous) {
            msg.setAsynchronous(true);
        }
        return queue.enqueueMessage(msg, uptimeMillis);
    }
```

可以看到，切换线程使用的`Handler.post(Runnable)`实际上只是把`Runnable`封装成`Message`，并添加到一个该`Handler`从`Looper`那里获取的`MessageQueue`中了，那么是谁来从`Queue`中取出`Message`并处理呢？答案就是`Looper`，来看2个`Looper`的关键方法：

```java
// Looper.prepare()
private static void prepare(boolean quitAllowed) {
    // 检查该线程是否已经创建过Looper，一个线程只允许创建一个Looper
    if (sThreadLocal.get() != null) {
        throw new RuntimeException("Only one Looper may be created per thread");
    }
    // 创建该线程私有的Looper
    sThreadLocal.set(new Looper(quitAllowed));
}
// Looper的构造器
private Looper(boolean quitAllowed) {
    // 创建MessageQueue
    mQueue = new MessageQueue(quitAllowed);
    mThread = Thread.currentThread();
}
```

`Looper.prepare()`会检查当前线程是否已经创建过`Looper`，没有的话就创建一个新的`Looper`并设置为该线程私有，留心的话，其实`Handler`构造时从线程中获取的`Looper`就是在这里创建的。`Looper`创建时会同时在内部创建一个`MessageQueue`，也就是`Handler.post()`时用到的那个`Queue`。

```java
// Looper.loop()，这里只取关键逻辑，完整逻辑请看源码
public static void loop() {
    // 确保已经执行过Looper.prepare()
    final Looper me = myLooper();
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    // 获取Looper的MessageQueue
    final MessageQueue queue = me.mQueue;
    // 进入一个阻塞线程的无限循环
    for (;;) {
        Message msg = queue.next(); // might block
        try {
            // 取出Message中保存的Handler实例，即发送该Message的Handler，调用它的相关方法去处理这个Message
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

`Looper.loop()`会进入一个无限的等待循环，不断检查`MessageQueue`中是否有新的`Message`，一旦获取到新的`Message`，就取出该`Message`在`post()`的时候保存的`Handler`实例，调用该`Handler`的方法来处理这个`Message`，这就是整个`Handler.post(Runnable)`的执行轨迹。那么最关键的线程切换是怎么完成的呢？需要注意`Looper.prepare()`执行时所在的线程，它就是`Runnable`事件被处理时所在的线程，这个和线程启用`Looper`时有关。

前面提到，`Handler`创建时必须要求该线程有`Looper`，即执行过`Looper.prepare()`，一个典型的创建支持`Looper`的线程是这样的：

```kotlin
class CusThread : Thread() {
    lateinit var handler: Handler
    override fun run() {
        Looper.prepare()
        handler = Handler()
        // 阻塞线程，等待处理Handler分发的事件
        Looper.loop()
    }
}
```

实际上，这个线程在创建了`Handler`之后，就因为执行`Looper.loop()`而阻塞，等待执行`Handler`分发的事件。注意到，`Looper.loop()`是在该线程中执行的，结合之前的源码分析，通过`Handler`发送的`Runnable`都会在这个线程中执行，而`Handler.post(Runnable)`这个行为可以在其它任意线程中进行，这就实现了，在其它线程中发送事件到指定的线程中处理，即广义上的切换线程。

可以这样使用上面的`CusThread`：

```kotlin
val thread = CusThread()
thread.start()
...
// 在其它线程中发送事件到CusThread线程中处理
Thread {
    thread.handler.post {
        // 这里的代码就会在CusThread中执行了
    }
}.start()
// 在必要时及时退出Looper.loop()引起的线程阻塞，结束该执行线程
thread.handler.looper.quite()
```

# 使用HandlerThread

普通的线程必须手动创建`Looper`才可以使用`Handler`，`Android`提供了一个默认创建好`Looper`的线程实现`HandlerThread`，原理和上面的`CusThread`大同小异，只是多了一些细节控制，可以这样使用它：

```kotlin
val handlerThread = HandlerThread("")
handlerThread.start()
// 创建Handler时传入指定的Looper，这样它就不会去获取创建线程的Looper
val handler = Handler(handlerThread.looper)
...
// 在其它线程中发送事件到CusThread线程中处理
Thread {
    handler.post {
        // 这里的代码就会在HandlerThread中执行了
    }
}.start()
// 在必要时及时退出Looper.loop()引起的线程阻塞，结束该执行线程
handler.looper.quite()
```

# 总结

`Handler`机制简单的说，是这样：`Handler`创建时需要一个`Looper`，可以是指定的`Looper`或默认使用当前线程的`Looper`，`Handler`获取此`Looper`的`MessageQueue`，当`Handler.post(Runnable)`执行时，`Handler`把此`Runnable`封装成`Message`并携带该`Handler`实例，发送到从`Looper`那里拿到的`MessageQueue`中。`Looper`在其创建线程中不断检查`MessageQueue`是否有新的`Message`，有的话就取出，调用附带的`Handler`实例方法去处理，因为`Handler`发送事件的线程和`Looper`执行事件的线程一般都不一致，这样就实现了`切换线程`。

# Main Thread的特殊性

可能已经注意到，既然创建`Handler`时要求该线程必须有`Looper`，否则直接抛出异常，那么`Android`的主线程为什么可以直接创建`Handler`呢？其实，可以创建就说明，这个主线程默认已经有了`Looper`，联想一下，`Android`实际上是由事件驱动的，主线程也可以说一直都在“阻塞”（即`Looper.loop()`），它在等待新的事件进行处理，所谓的“不能阻塞主线程”，实际指的是，不能阻塞主线程中的事件处理，体会一下区别，很有意思的。