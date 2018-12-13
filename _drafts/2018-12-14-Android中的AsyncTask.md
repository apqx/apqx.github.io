---
layout: post
type: essy
title:  "Android中的AsyncTask"
author: APQX
date:   2018-12-14 +0800
categories: essy
---

编写高性能的Android程序必需遵守2个最基本的`线程`原则：

* 在`工作线程`中执行耗时操作
* 在`主线程`中操作UI

要兼顾这两项，代码执行过程中`切换线程`就是一个频繁而必要的操作，在Android中，可以使用`Handler`来将`Message`和`Runnable`发送到指定的`线程`中执行

```
override fun onCreate(savedInstanceState: Bundle?) {
    val handler = Handler()

    Thread{
        val result: String
        // 执行第1个耗时操作
        result += doHardWork1()
        handler.post{
            // 弹出窗口，第1个耗时操作完成
            showDialog("work1 done")
        }
        // 执行第2个耗时操作
        result += doHardWork2()
        handler.post{
            // 弹出窗口，第1个耗时操作完成
            showDialog("work2 done")
        }
        // 执行第3个耗时操作
        result += doHadrWork3()
        handler.post{
            // 弹出窗口，所有操作执行完成，并返回执行结果
            showResult(result);
        }
    }.start()
}
```

