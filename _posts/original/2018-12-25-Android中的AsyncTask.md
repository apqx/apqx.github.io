---
layout: post
categories: original
title: "Android 中的 AsyncTask"
author: 立泉
mention: Thread Async Handler
date: 2018-12-25 19:30:00 +0800
description: Android 开发者需遵循 2 个基本线程规则，即只在主线程操作 UI 和不能阻塞主线程。要兼顾它们，代码执行中切换线程是必要且频繁的操作，可通过 Android 提供的 Handler 将 Message 或 Runnable 发送到指定线程中执行。AsyncTask 则是对 Handler 的进一步封装。
image: 
tags: Code Android Thread Handler SourceCode
---

Android 开发者需遵循 2 个基本线程规则：

* 只在主线程操作 UI
* 不能阻塞主线程

要兼顾它们，代码执行中切换线程是必要且频繁的操作，可通过 Android 提供的`Handler`将`Message`或`Runnable`发送到指定线程中执行：

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    val handler = Handler()

    Thread {
        val result: String
        // 执行第 1 个耗时操作
        result += doHardWork1()
        handler.post {
            // 弹出窗口，第 1 个耗时操作完成
            showDialog("Work1 done")
        }
        // 执行第 2 个耗时操作
        result += doHardWork2()
        handler.post {
            // 弹出窗口，第2个耗时操作完成
            showDialog("Work2 done")
        }
        // 执行第 3 个耗时操作
        result += doHardWork3()
        handler.post {
            // 弹出窗口，所有操作执行完成，返回执行结果
            showResult(result);
        }
    }.start()
}
```

看起来似乎还不错，而这只是 Kotlin，如果用 Java 是下面这样：

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    Handler handler = new Handler();

    new Thread(new Runnable(
        @Override
        public void run() {
            String result;
            // 执行第 1 个耗时操作
            result += doHardWork1();
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，第 1 个耗时操作完成
                    showDialog("Work1 done");
                }
            }); 
            // 执行第 2 个耗时操作
            result += doHardWork2();
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，第 2 个耗时操作完成
                    showDialog("Work2 done");
                }
            }) 
            // 执行第 3 个耗时操作
            result += doHardWork3()
            handler.post(new Runnable() {
                @Override
                public void run() {
                    // 弹出窗口，所有操作执行完成，返回执行结果
                    showResult(result);
                }
            })
        }
    ){}).start();
}
```

使用 Java 8 的 Lambda 表达式会好一些，但依然不够精炼。

所以`AsyncTask`应运而生，一个对`Handler`封装后专门执行短期耗时操作并根据进度信息更新 UI 的工具。

```kotlin
// 对象表达式创建继承自 AsyncTask 的匿名类实例，定义 AsyncTask 任务
val cusAsyncTask = object : AsyncTask<String, Int, String>() {

            /**
             * 运行在主线程，执行一些准备工作
             */
            override fun onPreExecute() {
                super.onPreExecute()
            }

            /**
             * 运行在主线程，接收工作线程传来的进度信息，用来更新 UI
             */
            override fun onProgressUpdate(vararg values: Int?) {
                super.onProgressUpdate(*values)
                // 根据进度信息，更新 UI
                showDialog("Work${values[0]} done")
            }

            /**
             * 运行在主线程，当工作线程执行完成后，会把结果发送到这里，更新UI
             */
            override fun onPostExecute(result: String?) {
                super.onPostExecute(result)
                // 弹出窗口，所有操作执行完成，返回执行结果
                showResult(result);
            }

            /**
             * 运行在工作线程，执行耗时操作，并向外传递进度信息
             */
            override fun doInBackground(vararg params: String?): String {
                var result: String = ""
                // 执行第 1 个耗时操作
                result += doHardWork1()
                // 更新进度，第 1 个耗时操作完成
                onProgressUpdate(1)
                // 执行第 2 个耗时操作
                result += doHardWork2()
                // 更新进度，第 2 个耗时操作完成
                onProgressUpdate(2)
                // 执行第 3 个耗时操作
                result += doHardWork3()
                // 更新进度，第 3 个耗时操作完成
                onProgressUpdate(3)
                // 返回执行结果
                return result;
            }

            /**
             * 运行在主线程，任务被取消时调用
             */
            override fun onCancelled(result: String?) {
                super.onCancelled(result)
            }

            /**
             * 运行在主线程，任务被取消时调用
             */
            override fun onCancelled() {
                super.onCancelled()
            }

        }
// 开始执行任务，必需在主线程调用
cusAsyncTask.execute("Will do")
```

耗时操作和更新 UI 的逻辑分别写在指定函数中，通过函数调用传递进度信息和执行结果，十分规整。不妨深入探索一下`AsyncTask`的实现原理，看看基于这种实现有什么特点和限制。

## 窥探源码

从启动任务开始：

```java
// 默认的 Executor 是静态的
private static volatile Executor sDefaultExecutor = SERIAL_EXECUTOR;

// 必须在主线程调用 execute()
@MainThread
public final AsyncTask<Params, Progress, Result> execute(Params... params) {
    // 传入了一个默认的线程 Executor
    return executeOnExecutor(sDefaultExecutor, params);
}

// 最终调用这个
@MainThread
public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
        Params... params) {
    // 先判断当前 AsyncTask 实例的状态
    if (mStatus != Status.PENDING) {
        switch (mStatus) {
            case RUNNING:
                // 如果任务已经在执行，抛出异常
                throw new IllegalStateException("Cannot execute task:"
                        + " the task is already running.");
            case FINISHED:
                // 如果此 AsyncTask实例已经执行过，抛出异常
                throw new IllegalStateException("Cannot execute task:"
                        + " the task has already been executed "
                        + "(a task can be executed only once)");
        }
    }
    // 设置当前 AsyncTask 实例状态为 执行中
    mStatus = Status.RUNNING;
    // 在主线程中调用 onPreExecute()
    onPreExecute();
    // 设置传入的参数
    mWorker.mParams = params;
    // 在传入的 Executor 中执行任务
    exec.execute(mFuture);

    return this;
}
```

可以看到，同一个`AsyncTask`实例只能执行一次，如果不指定任务运行的线程池则使用这个默认的`Executor`：

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
// 线程池定义
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

因为默认`Executor`是`static`且只会串行执行任务，所以同一个`AsyncTask`类创建多个实例调用`execute()`启动任务实际使用的是同一个`Executor`，后台任务串行执行而非并行。

`mFuture`应该是实际执行的后台任务，它在构造器中创建：

```java
public AsyncTask(@Nullable Looper callbackLooper) {
    // 创建 Handler，使用主线程的 MainLooper
    mHandler = callbackLooper == null || callbackLooper == Looper.getMainLooper()
        ? getMainHandler()
        : new Handler(callbackLooper);

    mWorker = new WorkerRunnable<Params, Result>() {
        public Result call() throws Exception {
            mTaskInvoked.set(true);
            Result result = null;
            try {
                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                // 调用 doInBackground() 执行后台任务，实际运行在线程池中
                result = doInBackground(mParams);
            } catch (Throwable tr) {
                mCancelled.set(true);
                throw tr;
            } finally {
                // 执行完成后调用 postResult() 返回执行结果，实际通过 Handler 运行在主线程中
                postResult(result);
            }
            return result;
        }
    };

    mFuture = new FutureTask<Result>(mWorker) {
        @Override
        protected void done() {
            // 执行完成后调用 postResult() 返回执行结果，实际通过 Handler 运行在主线程中
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
    // 使用 Handler 机制将执行结果发送到主线程
    @SuppressWarnings("unchecked")
    Message message = getHandler().obtainMessage(MESSAGE_POST_RESULT,
            new AsyncTaskResult<Result>(this, result));
    message.sendToTarget();
    return result;
}
```

实际`Handler`是这样的：

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
                // 调用 onProgressUpdate() 发布进度，运行在主线程中
                result.mTask.onProgressUpdate(result.mData);
                break;
        }
    }
}
```

执行完成时调用的`finish()`方法：

```java
private void finish(Result result) {
    if (isCancelled()) {
        // 任务已取消，调用 onCancelled()
        onCancelled(result);
    } else {
        // 任务正常结束，调用 onPostExecute()
        onPostExecute(result);
    }
    mStatus = Status.FINISHED;
}
```

可以看到，如果`AsyncTask`任务被取消，会调用`onCanceled()`而不是`onPostExecute()`来传递结果。

基于以上源码，`AsyncTask`有几个鲜明特点：

* 一个`AsyncTask`实例只能执行一次。
* 同一个`AsyncTask`的不同实例默认串行执行，但可以传入自己的`Executor`改变其行为，变为并行。
* `AsyncTask`可以被中断，中断后将调用`onCanceled()`返回结果而不是`onPostExecute()`。

最近热衷通过阅读源码分析某些组件的行为，之前只知道使用`AsyncTask`必须这样做，看过源码才知道为什么要这样做，知其然知其所以然。