---
layout: post
categories: original
title: "发布 Android 包到 GitHub Packages"
author: 立泉
mention: Gradle Maven
date: 2020-12-04 +0800
description: 成为全职Android开发者已有三年，在经手项目里积累了很多常用代码工具，也会在自己的业余项目中使用。但是每次都为它们重复创建Module很繁琐，直接打包为aar又会出现依赖问题。与jar一样，Gradle默认并不把外部依赖包塞进aar，需要在使用时手动引入，否则会因为依赖缺失而无法通过编译。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_jettools.jpg
tags: Code Android Gradle Build Maven GitHub
---

成为全职`Android`开发者已有三年，在经手项目里积累了很多常用代码工具，也会在自己的业余项目中使用。但是每次都为它们重复创建`Module`很繁琐，直接打包为`aar`又会出现依赖问题。与`jar`一样，`Gradle`默认并不把外部依赖包塞进`aar`，需要在使用时手动引入，否则会因为依赖缺失而无法通过编译。

为什么`Gradle`使用`Maven`仓库里的类库不需要手动引入依赖呢？其实，发布到`Maven`仓库的`aar`包同样不包含外部依赖，只不过`Maven`插件会自动生成一个`.pom`文件作为依赖列表，`Gradle`能获取到它，然后自动下载依赖。

既然如此，是否可以把自己的包发布到`Maven`仓库呢？当然可以，很多公司都会搭建内部`Maven`服务器实现组件共享，`Android`工程至少需要配置2个不同的`Maven`仓库：

```groovy
// Project 根目录的 build.gradle 文件

allprojects {
    repositories {
        // Google 的 Maven 仓库在阿里云的镜像
        maven { url 'https://maven.aliyun.com/repository/google' }
        // Maven Central 的 Maven 仓库在阿里云的镜像
        maven { url 'https://maven.aliyun.com/repository/central' }
    }
}
```

## GitHub Packages

`GitHub Packages`是`GitHub`托管的`Maven`仓库，允许将软件二进制包发布到指定的私有或公开`Repository`中，相比其它仓库的优势在于能把源码和编译后的包放到同一位置。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_jettools.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github packages" }

左边是源码，右边是发布的包，一目了然，这也是我倾向它的原因。

## Access token

`GitHub Packages`只允许获得授权的用户发包到指定`Repository`，也只有获得授权的用户才可以引入该`Repository`的包作为依赖，即发包和使用包都需要授权。这里的授权，指的是一个配置权限的用户`access token`，在`Settings`->`Developer settings`的`Personal access tokens`中管理。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_token.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github access token" }

创建`token`时，发包需要`write:packages`权限，获取包需要`read:packages`权限。注意必须按提示在`token`创建完成后把它记录下来，一旦离开这个页面就再也看不到它了。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_token_create.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github access token permission" }

## Publish

`Maven`为`Gradle`提供`maven-publish`插件以支持在`Gradle`中配置发包到指定`Maven`仓库，同时`Android Gradle plugin 3.6.0`以上已经包含对`maven-publish`的支持，可以把`Android`工程中定义的`build variant`包发布到`Maven`仓库。

```groovy
// Project 根目录的 build.gradle 文件

buildscript {
    ext.kotlin_version = "1.4.10"
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:4.1.1'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version'
    }
}
```

关于使用`build variant`创建不同类型包的问题，通常用于打出同版本的不同渠道包，参见另一篇文章：

[Gradle的Build Variant与多渠道打包]({% link _posts/original/2020-06-12-Gradle的Build Variant与多渠道打包.md %}){: target="_blank" }

比如在`Module`的`build.gradle`中定义`mi`和`play`2个`flavor`，用于配置发布到`小米商店`和`Google Play`商店的渠道包，它们与`release`和`debug`2个`build type`组合成4个`build variant`：

```sh
miRelease
miDebug
playRelease
playDebug
```

`Module`的`build.gradle`：

```groovy
android {
    // 2个 buildType
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    flavorDimensions 'version'

    // 2个 flavor
    productFlavors {
        mi {
            dimension = 'version'
            // 定义该 flavor 的特性
            ...
        }
        play {
            dimension = 'version'
            // 定义该 flavor 的特性
            ...
        }
    }
}
```

`Android Gradle plugin`会在编译时根据`build variant`为用于定义`Maven`发包类型的`components`对象生成对应属性，来实现发布指定`build variant`的包。

发包`token`属于私密信息，不能上传到公开仓库，可以在工程根目录下创建一个`github.properties`文件，不要`push`到`GitHub`上。

```sh
gpr.usr=user_name
gpr.key=your_token
```

配置要发包`Module`的`build.gradle`文件：

```groovy
// 要发包的 Module 的 build.gradle

// 本 Module 是一个 Android library，打包类型为 aar
apply plugin: 'com.android.library'
// 使用 maven-publish插件
apply plugin: 'maven-publish'

// 读取 github.properties 文件里的授权信息，不要把这个文件 push 到 GitHub
def githubProperties = new Properties()
githubProperties.load(new FileInputStream(rootProject.file("github.properties")))

// 因为用于定义发布类型的 components 是在 afterEvaluate 阶段被创建的，所以必须把发布配置写在 project.afterEvaluate {} 代码块中
project.afterEvaluate {
    // 定义发布
    publishing {
        // 定义要发布到的远程 Maven 仓库，可以定义多个，Gradle 会自动生成发送到指定 Maven 仓库的 task
        repositories {
            // GitHub Packages 仓库
            maven {
                name = "GitHubPackages"
                // 指定要发布到的 GitHub Repository 仓库 url
                url = uri("https://maven.pkg.github.com/apqx/JetTools")
                credentials {
                    // 用户名和token
                    username = githubProperties.getProperty("gpr.usr")
                    password = githubProperties.getProperty("gpr.key")
                }
            }
        }
        // 定义要发布的包，可以定义多个，Gradle 会自动生成把不同的包发送到指定的 Maven 仓库的 task
        publications {
            // 发布 build variant 为 miRelease 的包，
            myMiRelease(MavenPublication) {
                // 指定要发布的 build variant，在编译阶段 components 就已经根据工程配置的 build variant 生成了对应属性
                from components.miRelease
                // 定义 Maven 的3个参数，可以用 [groupId:artifactId:version] 定位到该包
                // 所以这3个参数的组合必须具有唯一性
                groupId = 'me.mudan.tools'
                artifactId = 'mi'
                version = '1.0.0'
            }

            // 发布 build variant 为 playRelease 的包，
            myPlayRelease(MavenPublication) {
                from components.playRelease
                groupId = 'me.mudan.tools'
                artifactId = 'play'
                version = '1.0.0'
            }
        }
    }
}
```

执行`sync`，`Gradle`会根据配置的发包信息生成对应的发包`task`：

```sh
publishMyMiReleasePublicationToGitHubPackagesRepository
publishMyMiReleasePublicationToMavenLocal
publishMyPlayReleasePublicationToGitHubPackagesRepository
publishMyPlayReleasePublicationToMavenLocal
```

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/gradle_task_maven.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="gradle task" }

执行指定`task`即可把对应包发布到对应`Maven`仓库，这里的`MavenLocal`是本地仓库，位置在`$USER_HOME/.m2/repository`目录下。

## Implement

添加包作为依赖需要先在工程根目录的`build.gradle`中配置其所在的`Maven`仓库，必须使用有`read:packages`权限的`token`。

```groovy
// Project 根目录的 build.gradle

buildscript {
    ext.kotlin_version = "1.4.20"
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }

        // 该包所在的 GitHub Repository 地址
        maven { url 'https://maven.pkg.github.com/apqx/JetTools'
            credentials {
                username = "user_name"
                password = "your_token"
            }
        }
    }
    ...
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }

        // 该包所在的 GitHub Repository 地址
        maven { url 'https://maven.pkg.github.com/apqx/JetTools'
            credentials {
                username = "apqx"
                password = "your_token"
            }
        }
    }
}
```

在要使用该包的`Module`中：

```groovy
// Module 的 build.gradle

dependencies {
    implementation 'me.apqx.tools:play:1.0.0'
}
```

## 一些限制

不同于常见`Maven`仓库，`GitHub Packages`需要授权，这种限制意味着它只适合应用在小圈子里，比如团队或个人的私有类库。

还有一点是关于删除已发布的包，`GitHub`允许删除私有仓库的包，但不允许删除公共仓库的包，因为可能已经有其它项目在使用。如果某个版本存在问题，正确解决方法不是删除而是发布一个修复问题的新版本。

更多信息参见`Android Developers`对[Maven Publish Gradle plugin](https://developer.android.com/studio/build/maven-publish-plugin){: target="_blank" }的描述。