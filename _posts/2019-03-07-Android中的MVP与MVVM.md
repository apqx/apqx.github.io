---
layout: post
type: essy
title:  "Android中的MVP与MVVM"
author: APQX
date:   2019-03-07 +0800
categories: essy
---

# 前言

当我刚开始学习`Android`的时候，哪里懂什么`设计模式`，只晓得`Activity`可以控制UI，也不知道那些操作数据的逻辑代码应该如何命名，便索性将所有代码堆砌在`Activity`和`Fragment`里，但随着我练习的逻辑越来越复杂，`Activity`的代码结构开始变得混乱起来，越来越臃肿，几乎无法维护，那种在一个`class文件`里的各种方法间到处跳来跳去的感觉，岂止是酸爽。后来，我看到了`MVP`，顿时有一点豁然开朗的感觉，原来还可以这样，它把`View`和`Model`彻底分离，用`Presenter`来承上启下，让代码里的每一个UI驱动的逻辑都变得十分清晰。

我确实很喜欢`MVP`，也把它大量用在了我的工作中，然后，我开始接触`Android Jetpack`，里面的`DataBinding`、`LiveData`和`ViewModel`都在向我预示着一个新的设计模式：`MVVM`。它的`View`和`Model`概念与`MVP`中一致，不同的是`ViewModel`，其核心思想是视图和数据进行双向绑定，当数据发生变化时，视图自动更新，而视图上的变化也会直接作用到数据上，我有点兴趣，做了些练习，想要了解它，然后尝试使用它。

# 古老的MVC

> Model View Controller

<img class="materialboxed responsive-img" src="{{ "/assets/mvc.png" }}" alt="pic">

* `View`即视图，用于接收UI事件，控制UI状态。
* `Model`即数据模型，用于处理数据，比如从数据库和网络中读写操作。
* `Controller`即控制器，它接收`View`传来的事件，定义具体的业务实现逻辑，调用`Model`操作数据，然后由`Model`通知`View`更新UI，在`Android`中，它一般是`Activity`和`Fragment`。

通过一个简单的实例来理解`MVC`的结构，UI上有一个按钮，点击按钮，查询一下天气，在`TextView`中显示结果，并弹出一个`Toast`。

## Model

```
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

## View

```
/**
 * 接收UI点击事件，并能控制UI
 */
class WeatherView(private var activity: Activity, onBtnClickListener: OnBtnClickListener) : Callback {
    private val btn = activity.findViewById<Button>(R.id.btn)
    private val tv = activity.findViewById<TextView>(R.id.tv)

    init {
        // 收到点击事件
        btn.setOnClickListener {
            // 通知Controller执行操作
            onBtnClickListener.onClick()
        }
    }

    /**
     * UI显示天气
     */
    fun showWeather(weather: String) {
        tv.text = weather
        Toast.makeText(activity, weather, Toast.LENGTH_SHORT).show()
    }

    /**
     * Model处理完成后，调用View更新UI
     */
    override fun querySuccess(weather: String) {
        showWeather(weather)
    }
}

/**
 * 用于通知Controller点击事件的监听器
 */
interface OnBtnClickListener {
    fun onClick()
}
```

## Controller

通常是`Activity`

```
/**
 * 接收UI事件，控制Model处理
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
     * View被点击时，调用Model处理数据
     */
    override fun onClick() {
        model.queryWeather()
    }
}
```

可以看到，UI层被从`Activity`中剥离，`Activity`作为`Controller`持有`View`和`Model`，`View`要实现在有事件发生时及时通知`Controller`，就必须持有`Controller`，而`Model`中又持有`View`的一个回调接口，当UI有事件发生时，`Controller`得到通知，它会调用`Model`中的方法去处理数据，完成后，`Model`调用`View`更新UI，这是一个完整的环形结构，相互之间都有依赖，并不符合低耦合高内聚的要求。


# 进化的MVP

> Model View Presenter

<img class="materialboxed responsive-img" src="{{ "/assets/mvp.png" }}" alt="pic">

* `View`即视图，用于接收UI事件，控制UI状态，一般为`Activity`和`Fragment`。
* `Model`即数据模型，用于处理数据，比如从数据库和网络中读写操作。
* `Presenter`即逻辑实现类，从`View`中接收事件，向下调用`Model`处理数据并获取结果，然后再向上控制`View`更新UI。

同样的例子，用`MVP`是这样的：

## Model

```
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

## View

通常是`Activity`

```
/**
 * 定义操作UI的接口
 */
interface IWeatherActivity {
    fun showWeather(weather: String)
}

/**
 * Activity实现操作UI的接口
 */
class WeatherActivity : Activity(), IWeatherActivity {
    private lateinit var iWeatherPresenter: IWeatherPresenter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_weather)
        // 创建Presenter
        iWeatherPresenter = WeatherPresenter(this)
        // Kotlin可以直接用id访问View实例
        btn.setOnClickListener {
            // 点击事件发生时，调用Presenter执行操作
            iWeatherPresenter.queryWeather()
        }
    }

    /**
     * UI显示天气
     */
    override fun showWeather(weather: String) {
        // Kotlin中可以直接用id访问View实例
        tv.text = weather
        Toast.makeText(activity, weather, Toast.LENGTH_SHORT).show()
    }
}

```

## Presenter

```
/**
 * 定义响应UI事件的接口
 */
interface IWeatherPresenter {
    fun queryWeather()
}

/**
 * 实现接口，构造器要求传入View以操作UI
 */
class WeatherPresenter(private val iWeatherActivity: IWeatherActivity) : IWeatherPresenter {

    /**
     * 具体的执行点击事件
     */
    override fun queryWeather() {
        val weatherModel = WeatherModel()
        // 调用Model获取数据，然后调用View更新UI
        iWeatherActivity.showWeather(weatherModel.queryWeather())
    }
}
```

可以看到，在`MVP`模式中，`View`和`Model`是完全分离的，`Activity`就是`View`，它持有`Presenter`，`Presenter`则持有`View`和`Model`，当有事件发生时，`View`通知`Presenter`执行操作，`Presenter`调用`Model`获取数据，然后调用`View`更新UI。由于`IPresenter`接口的存在，实际上可以根据需求创建多个不同实现的`Presenter`实例，具有很高的灵活性。

# 双向绑定的MVVM

> Model View ViewModel

<img class="materialboxed responsive-img" src="{{ "/assets/mvvm.png" }}" alt="pic">

* `View`即视图，用于接收UI事件，控制UI状态，一般为`Activity`和`Fragment`。
* `Model`即数据模型，用于处理数据，比如从数据库和网络中读写操作。
* `ViewModel`即视图模型，从`View`中接收事件，向下调用`Model`获取数据，数据被修改后，`View`将自动被更新。

其实，看起来`MVP`已经足够好了，既能实现`View`和`Model`的分离，又能使用多`Presenter`实例来改变UI事件的行为，但`MVC`和`MVP`都有一个共同的特点，就是UI总是是由数据驱动的，数据变化后必须使用`Model`或`Presenter`去主动更新UI，而`MVVM`则可以实现数据和UI的绑定，当数据变化时，UI自动更新，这一切在`Android`上的实现基础，就是`Jetpack`里的`DataBinding`和`LiveData`。

`DataBinding`把数据和UI资源`xml`文件绑定，`LiveData`则允许数据感知其所在组件的生命周期，在有效的生命周期内，当数据发生变化时，UI也会自动改变，同样是上面的例子，用`MVVM`是这样的：

## Model

```
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

## View

首先在`Layout`资源文件中定义`DataBinding`

```
// 
<layout
    xmlns:android="http://schemas.android.com/apk/res/android">
    <!--定义DataBinding中要和View绑定的数据-->
    <data>
        <variable
            name="weather"
            type="String"/>
    </data>
    <!--正常的View布局-->
    <LinearLayout
        android:orientation="vertical"
        android:layout_width="match_parent"
        android:layout_height="match_parent">
        <TextView
            android:id="@+id/tv"
            android:layout_width="match_parent"
            android:layout_height="40dp"
            <!--把内容设置为DataBinding的weather变量，
            这样点击按钮时，当数据发生变化，这里会直接随之变化-->
            android:text="@{weather}"/>
        <Button
            android:id="@+id/btn"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Show Weather"/>
    </LinearLayout>
</layout>

```

用`Activity`作为`View`

```
// 注意是AppCompatActivity
class WeatherActivity : AppCompatActivity() {
    private lateinit var dataBinding: ActivityWeatherBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 使用DataBinding将视图资源加载到Activity上
        dataBinding = DataBindingUtil.setContentView(this, R.layout.activity_weather)
        // 创建ViewModel，LiveData就保存在ViewModel中
        val weatherViewModel = ViewModelProviders.of(this).get(WeatherViewModel::class.java)
        // 绑定视图和数据
        dataBinding.weather = weatherViewModel.weatherLiveData.value
        // 当数据发生变化时，这里会得到通知
        weatherViewModel.weatherLiveData.observe(this, Observer<String> {
            // 弹出天气信息，注意这里的回调方法运行在LiveData发生变化的线程里
            tv.text = weatherViewModel.weatherLiveData.value
            Toast.makeText(this, weatherViewModel.weatherLiveData.value, Toast.LENGTH_SHORT).show()
        })
        // DataBinding可以直接使用id获取View实例
        dataBinding.btn.setOnClickListener {
            // 调用ViewModel执行点击操作
            weatherViewModel.queryWeather()
        }
    }
}
```

## ViewModel

```
/**
 * 执行数据查询并报告结果
 */
class WeatherViewModel : ViewModel() {
    private val weatherModel = WeatherModel()
    // LiveData保存天气数据
    var weatherLiveData: MutableLiveData<String> = MutableLiveData()

    init {
        // 初始化数据
        weatherLiveData.value = ""
    }

    fun queryWeather() {
        // 从Model中查询天气
        val weather =  weatherModel.queryWeather()
        // 查询完成后，设置LiveData数据，监听此LiveData数据的观察者会得到通知
        weatherLiveData.value =  weather
    }
}
```

可以看出`MVVM`与`MVP`最大的不同是，当`ViewModel`处理好事件逻辑，并更新数据后，UI是自动刷新的，而不是由`Presenter`去主动调用`View`的更新视图方法，而且也可以使用`DataBinding`直接在视图`xml`文件里定义UI对数据的响应操作，即实现，数据变化，UI自动根据数据去加载对应的逻辑内容，把数据和UI绑在一起，这样只需要在`ViewModel`中更新数据就可以了，而不用去管UI要怎么显示这些数据。

# 结语

我在工作和学习中大量使用过`MVP`，对`MVC`和`MVVM`只是有所耳闻，接触了`Kotlin`和`Jetpack`后，开始尝试在自己的练习中使用这些新的东西，而对于`“一直在计划中”👽`的`树莓派`机器人`重构`，这些都是基础，毕竟，2年多的时间，我的编程思维和代码风格已经发生了巨大的变化，也让我觉得，这个小小的电路板，充满了无限的可能性，如果我不偷懒的话。。。