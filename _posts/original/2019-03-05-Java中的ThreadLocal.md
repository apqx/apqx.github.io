---
layout: post
categories: original
title: "Java 中的 ThreadLocal"
author: 立泉
mention: 线程私有 源码 ThreadLocalMap
date: 2019-03-05 +0800
description: 没怎么用过但很好奇它是如何实现的线程私有数据，阅读源码获得的答案远比预期简单。
cover: 
tags: Code Java Thread SourceCode
---

在 Android 的消息机制中创建`Handler`需要一个`Looper`，如果不在构造器中指定会从当前线程获取：

```java
// Handler 构造器，获取当前线程的 Looper
mLooper = Looper.myLooper();

public static @Nullable Looper myLooper() {
        return sThreadLocal.get();
}
```

这里是使用`ThreadLocal`获取创建`Handler`时所在线程的`Looper`，再看一个例子：

```kotlin
fun main(args: Array<String>) {
    val threadLocal = ThreadLocal<Int>()
    Thread {
        var i = 0
        while (true) {
            threadLocal.set(i++)
            Thread.sleep(500)
            println("Thread-1 get " + threadLocal.get())
        }
    }.start()
    Thread {
        var i = 0
        while (true) {
            Thread.sleep(500)
            println("Thread-2 get " + threadLocal.get())
        }
    }.start()
    ...
}
```

启动 2 个线程，`Thread-1`和`Thread-2`使用同一个`ThreadLocal`对象分别在各自线程中读写数据，实际打印日志发现，即使`Thread-1`一直在向`ThreadLocal`中写数据，`Thread-2`读到的永远都是`null`，而`Thread-1`却可以正常的读出数据。即一个线程只能通过`TheadLocal`读取到该线程存储的数据，这就是`ThreadLocal`的功能。

具体是如何实现的，看一下`ThreadLocal`存取数据的源码：

```java
// ThreadLocal 用于存储数据的 set() 方法
public void set(T value) {
    Thread t = Thread.currentThread();
    // 实际存储数据的 map
    ThreadLocalMap map = t.threadLocals;
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}

// ThreadLocal 用于获取数据的 get() 方法
public T get() {
    Thread t = Thread.currentThread();
    // 实际存储数据的 map
    ThreadLocalMap map = t.threadLocals;
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;
            return result;
        }
    }
    return setInitialValue();
}
```

可以看到，数据实际是被保存在`Thread`内部持有的一个`ThreadLocalMap`实例对象中：

```java
// Thread 中的 ThreadLocalMap
class Thread {
    ...
    ThreadLocal.ThreadLocalMap threadLocals = null;
    ...
}
```

存取数据时`ThreadLocal`只是取出当前线程内部的`ThreadLocalMap`，再以自己作键向`Map`存入或取出数据。即数据最终是被保存在线程自己内部持有的对象里，`ThreadLocal`只是“中间商”，它本身不存储任何数据，只扮演一个`Key`的角色。