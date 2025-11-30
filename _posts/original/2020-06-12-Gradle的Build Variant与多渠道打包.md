---
layout: post
categories: original
title: "Gradle 的 Build Variant 与多渠道打包"
author: 立泉
mention: Android BuildType Flavor
date: 2020-06-12 +0800
description: 一个现实中的常见需求，同时也是反应国内 Android 生态现状的需求，即 iOS 开发中不存在的多渠道打包，反感归反感，解决方案是有的。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/module_build_variant.png
tags: Code Android Gradle Build
---

一个现实中的常见需求，同时也是反应国内 Android 生态现状的需求：

* 为不同应用商店生成同一版本号的渠道包，包中带有对应商店的标识符以统计渠道分发数据。
* 不同应用商店的审核策略不同，App 应根据渠道调整部分功能以满足合规要求。

即 iOS 开发中不存在的多渠道打包，解决方案是 Gradle 的`build variant`功能，可用 Groovy 语言在 Module 的`build.gradle`中配置不同打包类型的特有逻辑，实现用同一份代码打出符合要求的不同包。

## buildType 与 flavor

新建 Module 有`release`和`debug` 2 个默认`buildType`，可在`build.gradle`中为它们配置不同的签名、`applicationId`、应用名和其它诸如是否开启混淆、定义不同`Manifest`占位符等。

* `debug`即测试，如果未指定签名配置，默认使用 SDK 自带的`debug`签名文件。可用`adb`安装，不能在应用商店中发布。
* `release`即发布，没有默认签名配置。如果未指定签名，打包后是未签名`unsign`状态，不可被安装。

```groovy
// Module 的 build.gradle

android {
    signingConfigs {
        // 定义一个签名配置，不同 buildType 可使用不同签名
        mySign {
            storeFile file("../apqx.jks")
            storePassword "123456"
            keyAlias "apqx"
            keyPassword "123456"
        }
    }
    
    // 定义 3 个 buildType
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            // 应定义 release 的签名文件
            signingConfig signingConfigs.mySign
        }
        debug {
            // applicationId 加后缀
            // debug 模式下生成同的 applicationId，实现正式版和测试版共存
            applicationIdSuffix = '.debug'
            // 应定义 debug 的签名文件
            signingConfig signingConfigs.mySign
        }
        share {
            // 继承 release 定义的属性，下面定义的属性将覆盖继承的属性
            initWith release
            // applicationId 加后缀，使用与其它 buildType 不同的 applicationId
            applicationIdSuffix = '.share'
            // 这个 buildType 是能以 debug 模式安装到设备上的
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

执行`./gradlew assemble`，`gradle`会逐个打包 3 个`buildType`，默认输出路径为：

```sh
{project}/{module}/build/outputs/apk/{buildType}/{module}-{buildType}.apk
```

但其实 Gradle 为每个`buildType`（准确的说是每一个`build variant`）都生成了独立的打包`task`：

```sh
./gradlew assembleRelease
./gradlew assembleDebug
./gradlew assembleShare
```

`buildType`更多是面向`release`和`debug`维度，再细分打包类型即是`flavor`，每一个`flavor`都具有所有定义的`buildType`。

这里以发布到小米应用商店的`mi`和发布到 Google Play 的`play`为例，它们是 2 个`flavor`，每个`flavor`都有`release`、`debug`和`share` 3 种`buildType`，其中发布到小米应用商店的 App 名为`Mi`，发布到 Google Play 的 App 名为`Play`：

```groovy
// Module 的 build.gradle

android {
    signingConfigs {
        // 定义一个签名配置，不同 buildType 可使用不同的签名
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

        // 定一个 Manifest 占位符，AndroidManifest.xml 文件中用它来作 App 名，默认为 DEF
        // 不同 flavor 定义不同的 App 名
        manifestPlaceholders APP_NAME: 'DEF'
    }

    // 定义包含 flavor 的 Dimension，可定义不同的 Dimension 各自包含多个flavor，但一般只需定义一个
    flavorDimensions 'version'
    productflavors {
        // 发布到小米应用商店的 flavor
        mi {
            // release 生成目录为 {project}/{module}/build/outputs/apk/mi/release/app-mi-release.apk
            // debug 生成目录为 {project}/{module}/build/outputs/apk/mi/debug/app-mi-debug.apk
            // share 生成目录为 {project}/{module}/build/outputs/apk/mi/share/app-mi-share.apk
            dimension = 'version'
            // 修改 mi flavor 下的应用名
            manifestPlaceholders APP_NAME: 'Mi'
        }
        // 发布到 Google Play 应用商店的 flavor
        play {
            // release 生成目录为 {project}/{module}/build/outputs/apk/play/release/app-play-release.apk
            // debug 生成目录为 {project}/{module}/build/outputs/apk/play/debug/app-play-debug.apk
            // share 生成目录为 {project}/{module}/build/outputs/apk/play/share/app-play-share.apk
            dimension = 'version'
            // 修改 play flavor 下的应用名
            manifestPlaceholders APP_NAME: 'Play'
        }
    }
    
    // 定义 3 个 buildType
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.mySign
        }
        debug {
            applicationIdSuffix = '.debug'
            signingConfig signingConfigs.mySign
        }
        share {
            initWith release
            applicationIdSuffix = '.share'
            debuggable true
        }
    }
```

在`AndroidManifest.xml`文件中使用`flavor`定义的`Manifest`占位符，以实现不同`flavor`定义不同 App 名：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="me.apqx.demo">
    <!-- 使用 Manifest 占位符，会自动替换为 build.gradle 中定义的字符 -->
    <application
        android:label="${APP_NAME}">
    </application>
</manifest>
```

`sync`后执行`./gradlew tasks`，出现 6 个`assemble`打包`task`，其实还有一些更细粒度的打包`task`没有显示出来：

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

上面提到，`mi`和`play`各有`release`、`debug`和`share` 3 种`buildType`：

```sh
miRelease
miDebug
miShare
playRelease
playDebug
playShare
```

这些`flavor`和`buildType`的组合即是`build variant`，Gradle 会自动为每一个`build variant`生成打包`task`：

```sh
# 打包所有 build variant
./gradlew assemble

# 打包含有 release 的 2 个 build variant
./gradlew assembleRelease

# 打包含有 mi 的 3 个 build variant
./gradlew assembleMi

# 打包 mi 的 release 组成的 build variant
./gradlew assembleMiRelease
```

这些`gradle task`可在`Android Studio`的 Gradle 视图中找到，双击即可执行：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/gradle_task_build_variant.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="gradle task" }

## 自定义输出目录

公司一般有自己的打包服务器，打包时从仓库拉取代码执行 Gradle 打包指令，把格式化包名的包输出到指定目录下：

```groovy
// Module 的 build.gradle

android {

    /**
     * 过滤指定的 build variant，被过滤的 variant 将不会出现在打包系统里，即不会生成打包 task
     */
    variantFilter { variant ->
        // variant 名
        def names = variant.flavors*.name
        if (names.contains("mi")) {
            // Gradle 将忽略符合条件的 Variant
            setIgnore(true)
        }
    }

    // 默认的输出路径为 {project}/{module}/build/outputs/apk/{flavor}/{buildType}/{module}-{variant}-{buildType}.apk
    android.applicationVariants.all { variant ->
        // variant.name 为 {flavor}{buildType}，一般类似 miDebug
        // variant.versionName 为版本号，一般类似 1.0.0
        // variant.flavors.name 为 flavor 名，一般类似 [mi]
        // variant.buildType.name 为 buildType 名，一般为 release或debug
        variant.outputs.all {
            // 定义输出的 apk 路径和名字
            def apkName = "demo"
            // 相对默认输出路径向上跳 2 个层级，在 apk 目录下
            // 注意，这里不再允许使用相对于工程根目录的绝对路径
           outputFileName = "../../${variant.buildType.name}/${apkName}_${variant.name}_${variant.versionName}.apk"
        }
    }
}
```

## 多 Module 的 build variant

如果主 Module 依赖一个或多个 Library，主 Module 有多个`build variant`，Library 也有多个`build variant`，那么当执行主 Module 的某个`variant`的`assemble`打包指令时，编译器会尝试从它所依赖的 Library 中寻找同样的`flavor`和`buildType`组成的`variant`。如果没有找到，则使用 Library 默认的`variant`。

在 Android Studio 的 Build Variants 视图中可修改 Module 的默认`build variant`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200612/module_build_variant.png){: loading="lazy" class="clickable clickShowOriginalImg" alt="build variant" }
