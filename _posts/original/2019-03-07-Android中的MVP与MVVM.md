---
layout: post
categories: original
title: "Android 中的 MVP 与 MVVM"
author: 立泉
mention: 架构 生命周期 Jetpack
date: 2019-03-07 +0800
description: 我在工作中大量使用过 MVP，对 MVC 和 MVVM 只是有所耳闻，接触 Kotlin 和 Jetpack 后开始尝试在自己的练习中使用这些新东西，编程不再是入门时枯燥的堆砌代码，而是像打造艺术品一样津津有味，这样的变化真实而有趣。
cover: 
tags: Code Android MVP MVVM
---

初学 Android 只知道`Activity`可以控制 UI，并不懂设计模式，也不知道操作数据的逻辑代码应该如何归类，索性全堆砌在`Activity`和`Fragment`里。但随着功能逻辑的复杂化，`Activity`结构开始变得混乱、臃肿、难以维护，在长文件里到处跳跃的感觉岂止酸爽。后来看到 MVP 顿时豁然开朗，原来可以这样，它将`View`和`Model`分离用`Presenter`连接，代码中 UI 驱动的逻辑立刻清晰整洁。

我在工作中大量使用 MVP，之后接触 Jetpack，其`DataBinding`、`LiveData`和`ViewModel`向我预示一个新的设计模式： MVVM。它的`View`和`Model`概念与 MVP 一致，不同的是`ViewModel`，把视图和数据双向绑定，当数据发生变化时视图自动更新，而视图变化也会直接作用到数据上。这种比 MVP 更简洁的结构让我很感兴趣。

## 古老的 MVC

> Model View Controller

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20190307/mvc.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="mvc" }

* `View`即视图，用于接收 UI 事件，控制 UI 状态。
* `Model`即数据模型，用于处理数据，比如操作数据库和网络中。
* `Controller`即控制器，接收`View`传来的事件，定义具体业务逻辑，调用`Model`操作数据再由它通知`View`更新 UI。在 Android 中通常是`Activity`或`Fragment`。

通过一个简单例子理解 MVC：点击`Button`查询天气，在`TextView`中显示结果并弹出`Toast`。

### Model

```kotlin
/**
 * 执行数据查询并报告结果
 */
class WeatherModel(private val callBack: Callback) {

    fun queryWeather() {
        // 从网络中查询天气
        val weather =  ...
        // 查询完成后，报告结果
        callBack.querySuccess(weather)
    }
}

/**
 * 结果回调接口
 */
interface Callback {
    fun querySuccess(weather: String)
}
```

### View

```kotlin
/**
 * 接收 UI 点击事件，控制 UI
 */
class WeatherView(private var activity: Activity, onBtnClickListener: OnBtnClickListener) : Callback {
    private val btn = activity.findViewById<Button>(R.id.btn)
    private val tv = activity.findViewById<TextView>(R.id.tv)

    init {
        // 收到点击事件
        btn.setOnClickListener {
            // 通知 Controller 执行操作
            onBtnClickListener.onClick()
        }
    }

    /**
     * UI 显示天气
     */
    fun showWeather(weather: String) {
        tv.text = weather
        Toast.makeText(activity, weather, Toast.LENGTH_SHORT).show()
    }

    /**
     * Model 处理完成后调用 View 更新 UI
     */
    override fun querySuccess(weather: String) {
        showWeather(weather)
    }
}

/**
 * 用于通知 Controller 点击事件的监听器
 */
interface OnBtnClickListener {
    fun onClick()
}
```

### Controller

```kotlin
/**
 * 接收 UI 事件，控制 Model 处理
 */
class WeatherActivity : Activity(), OnBtnClickListener{
    private lateinit var model: WeatherModel
    private lateinit var view: WeatherView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_weather)
        view = WeatherView(this, this)
        model = WeatherModel(view)
    }

    /**
     * View 被点击时调用 Model 处理数据
     */
    override fun onClick() {
        model.queryWeather()
    }
}
```

UI 层被从`Activity`中剥离，`Activity`作为`Controller`持有`View`和`Model`。`View`反向持有`Controller`以实现在点击事件发生时触发查询，`Model`需要更新 UI 则持有`View`的回调接口，`Controller`调用`Model`查询数据，完成后由它回调`View`更新 UI。这是一个闭环结构，组件循环依赖并不符合低耦合规则。


## 进化的 MVP

> Model View Presenter

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20190307/mvp.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="mvp" }

* `View`即视图，用于接收 UI 事件，控制 UI 状态，一般是`Activity`或`Fragment`。
* `Model`即数据模型，用于处理数据，比如操作数据库和网络。
* `Presenter`即逻辑实现类，从`View`中接收事件，向下调用`Model`处理数据、获取结果，再向上控制`View`更新 UI。

同样的例子，用 MVP 是这样：

### Model

```kotlin
/**
 * 执行数据查询并返回结果
 */
class WeatherModel(private val callBack: Callback) {

    fun queryWeather(): String {
        // 从网络中查询天气
        val weather =  ...
        // 查询完成后，返回结果
        return weather
    }
}
```

### View

```kotlin
/**
 * 定义操作 UI 的接口
 */
interface IWeatherActivity {
    fun showWeather(weather: String)
}

/**
 * Activity 实现操作 UI 的接口
 */
class WeatherActivity : Activity(), IWeatherActivity {
    private lateinit var iWeatherPresenter: IWeatherPresenter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_weather)
        // 创建 Presenter
        iWeatherPresenter = WeatherPresenter(this)
        // Kotlin 可直接用 id 访问 View 实例
        btn.setOnClickListener {
            // 点击事件发生时，调用 Presenter 执行操作
            iWeatherPresenter.queryWeather()
        }
    }

    /**
     * UI 显示天气
     */
    override fun showWeather(weather: String) {
        tv.text = weather
        Toast.makeText(activity, weather, Toast.LENGTH_SHORT).show()
    }
}

```

### Presenter

```kotlin
/**
 * 定义响应 UI 事件的接口
 */
interface IWeatherPresenter {
    fun queryWeather()
}

/**
 * 实现接口，构造器要求传入 View 以操作 UI
 */
class WeatherPresenter(private val iWeatherActivity: IWeatherActivity) : IWeatherPresenter {

    /**
     * 具体的执行点击事件
     */
    override fun queryWeather() {
        val weatherModel = WeatherModel()
        // 调用 Model 获取数据，然后调用 View 更新 UI
        iWeatherActivity.showWeather(weatherModel.queryWeather())
    }
}
```

在 MVP 模式中`View`和`Model`完全分离，`Activity`作为`View`持有`Presenter`，`Presenter`则持有`View`和`Model`。当点击事件发生时，`View`通知`Presenter`执行操作，`Presenter`调用`Model`获取数据，然后调用`View`更新 UI。由于`IPresenter`接口的存在，实际上可根据需求创建多个不同实现的`Presenter`实例，具有很高的灵活性。

## 双向绑定的 MVVM

> Model View ViewModel

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20190307/mvvm.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="mvvm" }

* `View`即视图，用于接收 UI 事件，控制 UI 状态，一般是`Activity`或`Fragment`。
* `Model`即数据模型，用于处理数据，比如操作数据库和网络。
* `ViewModel`即视图模型，从`View`中接收事件，向下调用`Model`获取数据，数据被修改后`View`将随之自动更新。

MVP 已经足够好，既能实现`View`和`Model`的分离又能使用多`Presenter`实例改变 UI 事件的行为。但`MVC`和`MVP`都有一个共同特点，即 UI 由数据驱动，数据变化后必须使用`Model`或`Presenter`主动更新 UI。而`MVVM`可实现数据和 UI 的绑定，当数据变化时 UI 自动更新，这在 Android 上的实现基础是 Jetpack 组件里的`DataBinding`和`LiveData`。

`DataBinding`把数据和定义 UI 的 XML 文件绑定，`LiveData`支持数据感知其所在组件的生命周期，有效生命周期内的数据变化会自动触发 UI 改变。

同样上面的例子，用 MVVM 是这样：

### Model

```kotlin
/**
 * 执行数据查询并返回结果
 */
class WeatherModel() {

    fun queryWeather(): String {
        // 从网络中查询天气
        val weather =  ...
        // 查询完成后，返回结果
        return weather
    }
}
```

### View

首先在`Layout`资源文件中定义`DataBinding`：

```xml
<layout
    xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 定义 DataBinding 中要和 View 绑定的数据 -->
    <data>
        <variable
            name="weather"
            type="String"/>
    </data>
    <!-- 正常的 View 布局 -->
    <LinearLayout
        android:orientation="vertical"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        <TextView
            android:id="@+id/tv"
            android:layout_width="match_parent"
            android:layout_height="40dp"
            <!-- 内容设置为 DataBinding 的 weather 变量，
            点击按钮时，这里会随数据变化自动更新 -->
            android:text="@{weather}"/>
        <Button
            android:id="@+id/btn"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Show Weather"/>
    </LinearLayout>
</layout>
```

用`Activity`作为`View`：

```kotlin
// 注意是 AppCompatActivity
class WeatherActivity : AppCompatActivity() {
    private lateinit var dataBinding: ActivityWeatherBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 使用 DataBinding 将视图资源加载到 Activity上
        dataBinding = DataBindingUtil.setContentView(this, R.layout.activity_weather)
        // 创建 ViewModel，LiveData 保存在 ViewModel 中
        val weatherViewModel = ViewModelProviders.of(this).get(WeatherViewModel::class.java)
        // 绑定视图和数据
        dataBinding.weather = weatherViewModel.weatherLiveData.value
        // 数据发生变化时这里会得到通知
        weatherViewModel.weatherLiveData.observe(this, Observer<String> {
            // 弹出天气信息，注意这里的回调方法运行在 LiveData 发生变化的线程里
            tv.text = weatherViewModel.weatherLiveData.value
            Toast.makeText(this, weatherViewModel.weatherLiveData.value, Toast.LENGTH_SHORT).show()
        })
        // DataBinding 可直接使用 id 获取 View 实例
        dataBinding.btn.setOnClickListener {
            // 调用 ViewModel 执行点击操作
            weatherViewModel.queryWeather()
        }
    }
}
```

### ViewModel

```kotlin
/**
 * 执行数据查询并报告结果
 */
class WeatherViewModel : ViewModel() {
    private val weatherModel = WeatherModel()
    // LiveData 保存天气数据
    var weatherLiveData: MutableLiveData<String> = MutableLiveData()

    init {
        // 初始化数据
        weatherLiveData.value = ""
    }

    fun queryWeather() {
        // 从 Model 中查询天气
        val weather =  weatherModel.queryWeather()
        // 查询完成后更新 LiveData 数据，监听此 LiveData 的观察者会得到通知
        weatherLiveData.value =  weather
    }
}
```

可见 MVVM 与 MVP 最大的不同，当`ViewModel`处理事件、更新数据后 UI 是自动刷新的，而非由`Presenter`调用`View`更新视图的方法。此外可使用`DataBinding`直接在视图 XML 文件里定义 UI 对数据的响应操作，实现数据变化后 UI 自主调整显示方式。MVVM 把数据和 UI 绑定只需在`ViewModel`中更新数据而不用关心 UI 如何显示它们。

## 结语

我在工作中大量使用 MVP，对 MVC 和 MVVM 只是耳闻，接触 Kotlin 和 Jetpack 后尝试在练习中使用这些新东西，编程不再是入门时枯燥的堆砌代码而是像打造艺术品一样津津有味，这样的变化真实而有趣。