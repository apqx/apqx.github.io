---
layout: post
type: original
categories: original
title: "Android中的AsyncTask"
author: 立泉
date: 2018-12-25 +0800
description: 异步流RxJava越来越流行，可能Android原生提供的AsyncTask也很少有人用了。
cover: 
tags: CS Android
redirect_from:
    - /essy/2018/12/25/Android中的AsyncTask
---

编写高性能的`Android`程序必需遵守2个最基本的`线程`原则：

* 在`工作线程`中执行耗时操作
* 在`主线程`中操作UI

要兼顾这两项，代码执行过程中`切换线程`就是一个频繁而必要的操作，在`Android`中，可以使用`Handler`来将`Message`和`Runnable`发送到指定的`线程`中执行

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    val handler = Handler()

    Thread {
        val result: String
        // 执行第1个耗时操作
        result += doHardWork1()
        handler.post {
            // 弹出窗口，第1个耗时操作完成
            showDialog("work1 done")
        }
        // 执行第2个耗时操作
        result += doHardWork2()
        handler.post {
            // 弹出窗口，第2个耗时操作完成
            showDialog("work2 done")
        }
        // 执行第3个耗时操作
        result += doHadrWork3()
        handler.post {
            // 弹出窗口，所有操作执行完成，并返回执行结果
            showResult(result);
        }
    }.start()
}
```

虽然有很多层嵌套，但看起来似乎还不错，而这只是`Kotlin`，如果用`Java`，就是下面的这个样子

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    Handler handler = new Handler();

    new Thread(new Runnable(
        @Override
        public void run() {
            String result;
            // 执行第1个耗时操作
            result += doHardWork1();
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，第1个耗时操作完成
                    showDialog("work1 done");
                }
            }); 
            // 执行第2个耗时操作
            result += doHardWork2();
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，第2个耗时操作完成
                    showDialog("work2 done");
                }
            }) 
            // 执行第3个耗时操作
            result += doHadrWork3()
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，所有操作执行完成，并返回执行结果
                    showResult(result);
                }
            })
        }
    ){}).start();
}
```

使用`Java 8`的`Lambda`表达式可能会好一些，但还是不够优雅。

所以`Android`有了`AsyncTask`，一个对`Handler`进行多层封装，专门用来执行`短期耗时操作`并不断根据进度信息更新UI的工具。

```kotlin
// 这里用对象表达式创建继承自AsyncTask的匿名类实例，定义一个AsyncTask任务
val cusAsyncTask = object : AsyncTask<String, Int, String>() {

            /**
             * 运行在主线程中，执行一些准备工作
             */
            override fun onPreExecute() {
                super.onPreExecute()
            }

            /**
             * 运行在主线程中，接收工作线程传来的进度信息，用来更新UI
             */
            override fun onProgressUpdate(vararg values: Int?) {
                super.onProgressUpdate(*values)
                // 根据进度信息，更新UI
                showDialog("work${values[0]} done")
            }

            /**
             * 运行在主线程中，当工作线程执行完成后，会把结果发送到这里，更新UI
             */
            override fun onPostExecute(result: String?) {
                super.onPostExecute(result)
                // 弹出窗口，所有操作执行完成，并返回执行结果
                showResult(result);
            }

            /**
             * 运行在工作线程中，执行耗时操作，并向外传递进度信息
             */
            override fun doInBackground(vararg params: String?): String {
                var result: String = ""
                // 执行第1个耗时操作
                result += doHardWork1()
                // 更新进度，第1个耗时操作完成
                onProgressUpdate(1)
                // 执行第2个耗时操作
                result += doHardWork2()
                // 更新进度，第2个耗时操作完成
                onProgressUpdate(2)
                // 执行第3个耗时操作
                result += doHardWork3()
                // 更新进度，第3个耗时操作完成
                onProgressUpdate(3)
                // 返回执行结果
                return result;
            }

            /**
             * 运行在主线程中，任务被取消时调用
             */
            override fun onCancelled(result: String?) {
                super.onCancelled(result)
            }

            /**
             * 运行在主线程中，任务被取消时调用
             */
            override fun onCancelled() {
                super.onCancelled()
            }

        }
// 开始执行任务，必需在主线程总调用
cusAsyncTask.execute("will do")
```

可以发现，无论是`耗时操作`还是`更新UI`，所有的逻辑都写在它应该在的指定函数中，通过函数调用来传递`进度信息`和`执行结果`，十分规整，但我今天想介绍的是`AsyncTask`是如何实现的，基于这种实现，它有什么特点和限制，这个才是最有意思的。

# 窥探源码

从启动任务开始

```java
// 默认的Executor是静态的
private static volatile Executor sDefaultExecutor = SERIAL_EXECUTOR;

// 必须在主线程中调用execute()
@MainThread
public final AsyncTask<Params, Progress, Result> execute(Params... params) {
    // 传入了一个默认的线程Executor
    return executeOnExecutor(sDefaultExecutor, params);
}

// 最终调用这个
@MainThread
public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
        Params... params) {
    // 先判断当前AsyncTask实例的状态
    if (mStatus != Status.PENDING) {
        switch (mStatus) {
            case RUNNING:
                // 如果任务已经在执行，抛出异常
                throw new IllegalStateException("Cannot execute task:"
                        + " the task is already running.");
            case FINISHED:
                // 如果此AsyncTask实例已经执行过了，抛出异常
                throw new IllegalStateException("Cannot execute task:"
                        + " the task has already been executed "
                        + "(a task can be executed only once)");
        }
    }
    // 设置当前AsyncTask实例状态为 执行中
    mStatus = Status.RUNNING;
    // 在主线程中调用onPreExecute()
    onPreExecute();
    // 设置传入的参数
    mWorker.mParams = params;
    // 在传入的Executor中执行任务
    exec.execute(mFuture);

    return this;
}
```

可以看到，同一个`AsyncTask`实例只能执行一次，且可以让任务在指定的`线程池`中执行，否则即运行在默认的`线程池`中，这个默认的`Executor`是这样的

```java
private static class SerialExecutor implements Executor {
    final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();
    Runnable mActive;

    public synchronized void execute(final Runnable r) {
        mTasks.offer(new Runnable() {
            public void run() {
                // 任务是串行的，执行完一个，再执行下一个
                try {
                    r.run();
                } finally {
                    scheduleNext();
                }
            }
        });
        if (mActive == null) {
            scheduleNext();
        }
    }

    protected synchronized void scheduleNext() {
        if ((mActive = mTasks.poll()) != null) {
            // 最终执行任务的线程池
            THREAD_POOL_EXECUTOR.execute(mActive);
        }
    }
}
// 线程池的定义
private static final int CPU_COUNT = Runtime.getRuntime().availableProcessors();
// We want at least 2 threads and at most 4 threads in the core pool,
// preferring to have 1 less than the CPU count to avoid saturating
// the CPU with background work
private static final int CORE_POOL_SIZE = Math.max(2, Math.min(CPU_COUNT - 1, 4));
private static final int MAXIMUM_POOL_SIZE = CPU_COUNT * 2 + 1;
private static final int KEEP_ALIVE_SECONDS = 30;
ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
                CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE_SECONDS, TimeUnit.SECONDS,
                sPoolWorkQueue, sThreadFactory);
threadPoolExecutor.allowCoreThreadTimeOut(true);
THREAD_POOL_EXECUTOR = threadPoolExecutor;
```

因为默认的`Executor`是`静态`的，且它只会`串行`的执行任务，所以虽然同一个`AsyncTask`可以创建很多个实例，可以同时调用`execute()`开始任务，但它们在默认情况下使用的是同一个`Executor`，所以这些后台任务执行时是`串行`而不是`并行`。

`mFuture`应该就是实际执行的后台任务，它是在`构造器`中定义的

```java
public AsyncTask(@Nullable Looper callbackLooper) {
    // 创建Handler，使用主线程的MainLooper
    mHandler = callbackLooper == null || callbackLooper == Looper.getMainLooper()
        ? getMainHandler()
        : new Handler(callbackLooper);

    mWorker = new WorkerRunnable<Params, Result>() {
        public Result call() throws Exception {
            mTaskInvoked.set(true);
            Result result = null;
            try {
                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                // 调用doInBackground()执行后台任务，实际运行在线程池中
                result = doInBackground(mParams);
            } catch (Throwable tr) {
                mCancelled.set(true);
                throw tr;
            } finally {
                // 执行完成后调用postResult()返回执行结果，实际通过Handler运行在主线程中
                postResult(result);
            }
            return result;
        }
    };

    mFuture = new FutureTask<Result>(mWorker) {
        @Override
        protected void done() {
            // 执行完成后调用postResult()返回执行结果，实际通过Handler运行在主线程中
            try {
                postResultIfNotInvoked(get());
            } catch (InterruptedException e) {
                android.util.Log.w(LOG_TAG, e);
            } catch (ExecutionException e) {
                throw new RuntimeException("An error occurred while executing doInBackground()",
                        e.getCause());
            } catch (CancellationException e) {
                postResultIfNotInvoked(null);
            }
        }
    };
}

private void postResultIfNotInvoked(Result result) {
    final boolean wasTaskInvoked = mTaskInvoked.get();
    if (!wasTaskInvoked) {
        postResult(result);
    }
}

private Result postResult(Result result) {
    // 使用Handler机制将执行结果发送到主线程
    @SuppressWarnings("unchecked")
    Message message = getHandler().obtainMessage(MESSAGE_POST_RESULT,
            new AsyncTaskResult<Result>(this, result));
    message.sendToTarget();
    return result;
}
```

实际的`Handler`是这样的

```java
private static class InternalHandler extends Handler {
    public InternalHandler(Looper looper) {
        super(looper);
    }

    @SuppressWarnings({"unchecked", "RawUseOfParameterizedType"})
    @Override
    public void handleMessage(Message msg) {
        AsyncTaskResult<?> result = (AsyncTaskResult<?>) msg.obj;
        switch (msg.what) {
            case MESSAGE_POST_RESULT:
                // 执行完成，运行在主线程中
                result.mTask.finish(result.mData[0]);
                break;
            case MESSAGE_POST_PROGRESS:
                // 调用onProgressUpdate()发布进度，运行在主线程中
                result.mTask.onProgressUpdate(result.mData);
                break;
        }
    }
}
```

执行完成时调用的`finish()`方法

```java
private void finish(Result result) {
    if (isCancelled()) {
        // 任务已取消，调用onCancelled()
        onCancelled(result);
    } else {
        // 任务正常结束，调用onPostExecute()
        onPostExecute(result);
    }
    mStatus = Status.FINISHED;
}
```

可以看到，如果`AsyncTask`任务被取消，则会调用`onCanceled()`而不是`onPostExecute()`来传递结果。

基于上面的源码分析，可以看出`AsyncTask`的几个鲜明的特点

* 一个`AsyncTask`实例只能执行一次
* 同一个`AsyncTask`的不同实例默认是串行执行的，但可以传入自己的`Executor`来改变其行为，比如变为并行
* `AsyncTask`是可以被中断的，中断后将调用`onCanceled()`返回结果而不是`onPostExecute()`

# 结语

最近越来越喜欢通过阅读源码来分析某些组件的行为特点，之前只知道要使用`AsyncTask`必须这样做，看了源码才知道为什么要这样做。