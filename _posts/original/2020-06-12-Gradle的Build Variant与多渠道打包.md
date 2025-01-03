---
layout: post
categories: original
title: "Gradle的Build Variant与多渠道打包"
author: 立泉
mention: 应用分发 Build Flavor
date: 2020-06-12 +0800
description: 一个现实中的常见需求，同时也是我对国内混乱的Android生态最无语的需求，也就是iOS开发中不存在的“多渠道打包”，不过不喜欢归不喜欢，解决方案是有的。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/module_build_variant.png
tags: Code Android Gradle Build
---

一个现实中的常见需求，同时也是我对国内混乱的`Android`生态最无语的需求：

* 为不同应用商店生成同一版本号的不同渠道包，包中需带有对应商店的标识符，以统计渠道分发数据。
* 不同应用商店的审核策略不同，App应根据渠道调整部分功能状态以满足合规要求。

即`iOS`开发中不存在的`多渠道打包`，解决方案是`gradle`的`build variant`，可以用`Groovy`语言在`Module`的`build.gradle`中配置不同打包类型的特有逻辑，以实现用同一份代码打出符合要求的不同包。

## buildType与flavor

新建`Module`有`release`和`debug`2个默认`buildType`，可以在`build.gradle`中为它们配置不同的`签名`、`applicationId`、`应用名`和其它诸如是否开启混淆、定义不同`Manifest`占位符等。

* `debug`测试，如果未指定签名配置，默认使用`SDK`自带的`debug`签名文件。可以`adb`安装，但不能在应用商店中发布。
* `release`发布，没有默认签名配置。如果未指定签名，打包后就是未签名`unsign`状态，不可以被安装。

```groovy
// Module的build.gradle

android {
    signingConfigs {
        // 定义一个签名配置，不同buildType可以使用不同签名
        mySign {
            storeFile file("../apqx.jks")
            storePassword "123456"
            keyAlias "apqx"
            keyPassword "123456"
        }
    }
    
    // 定义3个buildType
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            // 应定义release的签名文件
            signingConfig signingConfigs.mySign
        }
        debug {
            // applicationId加后缀
            // debug模式下生成同的applicationId，实现让正式版和测试版共存
            applicationIdSuffix = '.debug'
            // 应定义debug的签名文件
            signingConfig signingConfigs.mySign
        }
        share {
            // 继承release定义的属性，下面定义的属性将会覆盖已继承的属性
            initWith release
            // applicationId加后缀，使用与其它buildType不同的applicationId
            applicationIdSuffix = '.share'
            // 这个buildType是能以debug模式安装到设备上的
            debuggable true
        }
    }
```

`sync`之后在工程根目录执行`./gradlew tasks`，列表里只有一个`assemble`打包`task`：

```sh
./gradlew tasks

Build tasks
-----------
assemble - Assemble main outputs for all the variants.
```

执行`./gradlew assemble`，`gradle`会逐个打包3个`buildType`，默认输出路径为：

```sh
{project}/{module}/build/outputs/apk/{buildType}/{module}-{buildType}.apk
```

但其实`gradle`为每个`buildType`（准确的说是每一个`build variant`，后面会提到）都生成了单独的打包`task`：

```sh
./gradlew assembleRelease
./gradlew assembleDebug
./gradlew assembleShare
```

`buildType`更多的是面向`release`和`debug`这2个维度，`buildType`中再细分打包类型，就是`flavor`，准确的说，每一个`flavor`都具有所有定义的`buildType`。

这里以发布到小米应用商店的`mi`和发布到`Google Play`的`play`为例，它们是2个`flavor`，每个`flavor`都有`release`、`debug`和`share`3种`buildType`，其中发布到小米应用商店的App名为`Mi`，发布到`Google Play`的App名为`Play`：

```groovy
// Module的build.gradle

android {
    signingConfigs {
        // 定义一个签名配置，不同的buildType可以使用不同的签名
        mySign {
            storeFile file("../apqx.jks")
            storePassword "123456"
            keyAlias "apqx"
            keyPassword "123456"
        }
    }
    compileSdkVersion 29
    buildToolsVersion "29.0.3"
    defaultConfig {
        applicationId "me.apqx.test"
        minSdkVersion 16
        targetSdkVersion 29
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"

        // 定一个Manifest占位符，AndroidManifest.xml文件中用它来作App名，默认为DEF
        // 不同的flavor定义不同的App名
        manifestPlaceholders APP_NAME: 'DEF'
    }

    // 定义包含flavor的Dimiension，可以定义不同的Dimiension各自包含多个flavor，但一般只需要定义一个即可
    flavorDimensions 'version'
    productflavors {
        // 发布到小米应用商店的flavor
        mi {
            // release生成目录为{project}/{module}/build/outputs/apk/mi/release/app-mi-release.apk
            // debug生成目录为{project}/{module}/build/outputs/apk/mi/debug/app-mi-debug.apk
            // share生成目录为{project}/{module}/build/outputs/apk/mi/share/app-mi-share.apk
            dimension = 'version'
            // 修改mi flavor下的应用名
            manifestPlaceholders APP_NAME: 'Mi'
        }
        // 发布到Google Play应用商店的flavor
        play {
            // release生成目录为{project}/{module}/build/outputs/apk/play/release/app-play-release.apk
            // debug生成目录为{project}/{module}/build/outputs/apk/play/debug/app-play-debug.apk
            // share生成目录为{project}/{module}/build/outputs/apk/play/share/app-play-share.apk
            dimension = 'version'
            // 修改play flavor下的应用名
            manifestPlaceholders APP_NAME: 'Play'
        }
    }
    
    // 定义3个buildType
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            // 应定义release的签名文件
            signingConfig signingConfigs.mySign
        }
        debug {
            // applicationId加后缀
            // debug模式下生成不一样的applicationId，实现让正式版和测试版共存
            applicationIdSuffix = '.debug'
            // 应定义debug的签名文件
            signingConfig signingConfigs.mySign
        }
        share {
            // 继承release定义的属性，下面定义的属性将会覆盖已继承的属性
            initWith release
            // applicationId加后缀，使用与其它buildType不一样的applicationId
            applicationIdSuffix = '.share'
            // 这个buildType是可以以debug模式安装到设备上的
            debuggable true
        }
    }
```

在`AndroidManifest`文件中使用`flavor`定义的`Manifest`占位符，以实现不同`flavor`定义不同App名：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="me.apqx.demo">
    <!-- 使用Manifest占位符，会自动替换为build.gradle中定义的字符 -->
    <application
        android:label="${APP_NAME}">
    </application>
</manifest>
```

`sync`后执行`./gradlew tasks`，出现了6个`assemble`打包`task`，但其实还有一些更细粒度的打包`task`没有显示出来。

```sh
./gradlew tasks

Build tasks
-----------
assemble - Assemble main outputs for all the variants.
assembleDebug - Assembles main outputs for all Debug variants.
assembleMi - Assembles main outputs for all Mi variants.
assemblePlay - Assembles main outputs for all Play variants.
assembleRelease - Assembles main outputs for all Release variants.
assembleShare - Assembles main outputs for all Share variants.
```

上面提到，`mi`和`play`都各自有`release`、`debug`和`share`3种`buildType`：

```sh
miRelease
miDebug
miShare
playRelease
playDebug
playShare
```

这些`flavor`和`buildType`的组合就是`build variant`，`gradle`会自动为每一个`build variant`生成打包`task`：

```sh
# 打包所有build variant
./gradlew assemble

# 打包含有release的2个build variant
./gradlew assembleRelease

# 打包含有mi的3个build variant
./gradlew assembleMi

# 打包mi的release组成的build variant
./gradlew assembleMiRelease
```

这些`gradle task`也可以在`Android Studio`的`Gradle`视图中找到，双击便可执行。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/gradle_task_build_variant.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="gradle task" }

## 自定义输出包目录

很多公司都有自己的打包服务器，打包时从`svn`或`git`仓库拉取代码，执行`gradle`打包指令，把格式化包名的包输出到指定目录下：

```groovy
// Module的build.gradle

android {

    /**
     * 过滤指定的build variant，被过滤的variant将不会出现在打包系统里，即不会生成打包task
     */
    variantFilter { variant ->
        // variant名
        def names = variant.flavors*.name
        if (names.contains("mi")) {
            // gradle将会忽略符合条件的Variant
            setIgnore(true)
        }
    }

    // 默认的输出路径为 {project}/{module}/build/outputs/apk/{flavor}/{buildType}/{module}-{variant}-{buildType}.apk
    android.applicationVariants.all { variant ->
        // variant.name 为 {flavor}{buildType}，一般类似 miDebug
        // variant.versionName 为 版本号，一般类似 1.0.0
        // variant.flavors.name 为 flavor名，一般类似[mi]
        // variant.buildType.name 为 buildType名，一般为release或debug
        variant.outputs.all {
            // 定义输出的apk路径和名字
            def apkName = "demo"
            // 相对于默认的输出路径，向上跳2个层级，在apk目录下
            // 注意，这里不再允许使用相对于工程根目录的绝对路径
           outputFileName = "../../${variant.buildType.name}/${apkName}_${variant.name}_${variant.versionName}.apk"
        }
    }
}
```

## 多Module的build variant

如果主`Module`依赖一个或多个`Library`，主`Module`有多个`build variant`，`Library`也有多个`build variant`，那么当执行主`Module`的某个`variant`的`assemble`打包指令时，编译器会尝试从它所依赖的`Library`中寻找同样的`flavor`和`buildType`组成的`variant`。如果没有找到，则使用`Library`默认的`variant`。

在`Android Studio`的`Build Variants`视图中，可以修改每一个`Module`的默认`build variant`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/module_build_variant.png){: loading="lazy" class="clickable clickShowOriginalImg" alt="build variant" }
