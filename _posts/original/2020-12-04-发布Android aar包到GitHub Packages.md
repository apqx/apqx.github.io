---
layout: post
categories: original
title: "发布Android aar包到GitHub Packages"
author: 立泉
mention: Gradle Maven
date: 2020-12-04 +0800
description: 成为一个全职Android开发工程师已有三年，经手的项目很多，也积累了一些自己常用的代码工具，我把它们封装到一个Library里在我的各个业余项目中使用。但是每次都在工程中为它单独创建一个Module显然太过麻烦，直接打包为aar又会出现一些依赖问题，因为gradle并不会把外部依赖直接写进aar中，这意味着必须在使用该aar的Module里手动引入这些依赖，否则就会因为依赖缺失而无法通过编译。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_jettools.jpg
tags: Code Android Gradle Build Maven GitHub
---

成为一个全职`Android`开发工程师已有三年，经手的项目很多，也积累了一些自己常用的代码工具，我把它们封装到一个`Library`里在我的各个业余项目中使用。但是每次都在工程中为它单独创建一个`Module`显然太过麻烦，直接打包为`aar`又会出现一些依赖问题，因为`gradle`并不会把外部依赖直接写进`aar`中，这意味着必须在使用该`aar`的`Module`里手动引入这些依赖，否则就会因为依赖缺失而无法通过编译。

那么为什么`gradle`使用`Maven`里的类库可以不用手动引入依赖呢？其实，发布到`Maven`仓库的`aar`包同样不包含任何依赖，只不过发布时`Maven`插件会自动生成一个包含所有依赖的`.pom`文件，而`gradle`在使用`Maven`里的类库时会自动下载这个文件，并根据它的内容去下载指定版本的依赖包。

既然如此，是否可以把自己的包发布到`Maven`仓库呢？当然可以，很多公司都会搭建自己的`Maven`服务器来实现一些通用包的共享，在内网中获得非常快的访问速度。注意这里提到了可以自己搭建`Maven`仓库，所以`Maven`只是一种通用的远程依赖管理技术，并不特指某一个仓库，比如`Android`工程就配置了几个指向不同`URL`的`Maven`仓库。

```groovy
// project根目录的build.gradle文件

allprojects {
    repositories {
        // google的maven仓库在阿里云上的镜像
        maven { url 'https://maven.aliyun.com/repository/google' }
        // maven central的maven仓库在阿里云上的镜像
        maven { url 'https://maven.aliyun.com/repository/central' }
    }
}
```

## GitHub Packages

`GitHub Packages`是`GitHub`托管的`Maven`仓库，它允许将软件二进制包发布到指定的私有或公开的`Repository`中，所以相比其它仓库其优势也就在于能把源码和编译后的包放到同一个位置。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_jettools.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github packages" }

左边是源码，右边是发布的包，一目了然，这也是我更喜欢使用它的原因。

## Access token

`GitHub Packages`只允许获得授权的用户把包发布到指定的`Repository`中，也只有获得授权的用户才可以用`gradle`引入该`Repository`的包作为项目的远程依赖，即发包和使用包都需要授权。这里的授权，指的是一个配置了指定权限的用户`access token`，在`Settings` -> `Developer settings`的`Personal access tokens`里可以创建或删除`token`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_token.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github access token" }

创建`token`时，如果想要向一个`Repository`中发布包，需要`write:packages`权限，如果只是读取包，只需要`read:packages`。要注意的是，必须按提示在`token`创建完成后把它记录下来，一旦离开这个页面就再也看不到它了。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/github_packages_token_create.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="github access token permission" }

## gradle发布包

`Maven`为`gradle`提供了`maven-publish`插件以支持在`gradle`中配置自动把包发布到指定的`Maven`仓库，同时`Android Gradle plugin 3.6.0`以上则包含了对`maven-publish`的支持，可以把`Android`工程中定义的`build variant`包发布到`Maven`仓库。

```groovy
// project根目录的build.gradle文件

buildscript {
    ext.kotlin_version = "1.4.10"
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
    }
    dependencies {
        // Android Gradle plugin版本
        classpath 'com.android.tools.build:gradle:4.1.1'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

关于使用`build variant`创建不同类型包的相关问题，通常用于打出同一个版本的不同渠道包，可以查看我的另一篇文章：


[使用Gradle创建不同的打包类型]({% link _posts/original/2020-06-12-使用Gradle创建不同的打包类型.md %}){: target="_blank" }

比如在该`Module`的`build.gradle`中定义了`mi`和`play`2个`flavor`，用于配置发布到`小米商店`和`Google Play`商店的渠道包，它们与`release`和`debug`2个`build type`组合就可以有4个`build variant`：

```sh
miRelease
miDebug
playRelease
playDebug
```

```groovy
// Module的build.gradle

// 在要发包的Module中定义build variant，默认只有release和debug
// 可以根据打包需求定义不同的build variant来打出不同配置的包
android {
    // 2个buildType
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

    // 2个flavor
    productFlavors {
        mi {
            dimension = 'version'
            // 定义该flavor的特性
            ...
        }
        play {
            dimension = 'version'
            // 定义该flavor的特性
            ...
        }
    }
}
```

那么`Android Gradle plugin`就会在工程编译时根据`build variant`为用于定义`Maven`发包类型的`components`对象生成对应的属性，来实现发布指定`build variant`的包。

用于发包的`token`属于私密信息，上传到`GitHub`公开仓库的工程一般都不希望`token`被公开，可以在工程根目录下创建一个`github.properties`文件，存放用户名和`token`，但不要`push`到`GitHub`上。

```sh
gpr.usr=user_name
gpr.key=your_token
```

配置要发包`Module`的`build.gradle`文件：

```groovy
// 要发包的Module的build.gradle

// 本Module是一个Android library，打包类型为aar
apply plugin: 'com.android.library'
// 使用maven-publish插件
apply plugin: 'maven-publish'

// 读取github.properties文件里的授权信息，不要把这个文件push到GitHub
def githubProperties = new Properties()
githubProperties.load(new FileInputStream(rootProject.file("github.properties")))

// 因为用于定义发布类型的components是在afterEvaluate阶段被创建的，所以必须把发布配置写在project.afterEvaluate {}代码块中
project.afterEvaluate {
    // 定义发布
    publishing {
        // 定义要发布到的远程Maven仓库，可以定义多个，gradle会自动生成发送到指定Maven仓库的task
        repositories {
            // GitHub Packages仓库
            maven {
                name = "GitHubPackages"
                // 指定要发布到的GitHub Repository仓库url
                url = uri("https://maven.pkg.github.com/apqx/JetTools")
                credentials {
                    // 用户名和token
                    username = githubProperties.getProperty("gpr.usr")
                    password = githubProperties.getProperty("gpr.key")
                }
            }
        }
        // 定义要发布的包，可以定义多个，gradle会自动生成把不同的包发送到指定的Maven仓库的task
        publications {
            // 发布build variant为miRelease的包，
            myMiRelease(MavenPublication) {
                // 指定要发布的build variant，在编译阶段，components就已经根据工程配置的build variant生成了对应的属性
                from components.miRelease

                // 定义Maven的3个参数，可以用[groupId:artifactId:version]定位到该包
                // 所以这3个参数的组合必须具有唯一性
                groupId = 'me.apqx.jettools'
                artifactId = 'mi'
                // 包版本
                version = '1.0.0'
            }

            // 发布build variant为playRelease的包，
            myPlayRelease(MavenPublication) {
                // 指定要发布的build variant，在编译阶段，components就已经根据工程配置的build variant生成了对应的属性
                from components.playRelease

                // 定义Maven的3个参数，可以用[groupId:artifactId:version]定位到该包
                // 所以这3个参数的组合必须具有唯一性
                groupId = 'me.apqx.jettools'
                artifactId = 'play'
                // 包版本
                version = '1.0.0'
            }
        }
    }
}
```

执行`sync`之后，`gradle`会根据配置的发包信息自动生成对应的发包`task`：

```sh
publishMyMiReleasePublicationToGitHubPackagesRepository
publishMyMiReleasePublicationToMavenLocal
publishMyPlayReleasePublicationToGitHubPackagesRepository
publishMyPlayReleasePublicationToMavenLocal
```

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20201204/gradle_task_maven.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="gradle task" }

执行对应的`task`即可把指定的包发布到指定的`Maven`仓库，这里的`MavenLocal`是本地仓库，位置在`$USER_HOME/.m2/repository`目录下，`aar`包中同样不包含依赖，同样也会生成包含依赖列表的`.pom`文件。

## gradle依赖包

首先，需要把该包所在的`GitHub Repository`地址，即发包时的`Maven`仓库地址，配置到工程根目录的`build.gradle`中。

注意，必须使用有`read:packages`权限的`token`，不然不能访问到该包。

```groovy
// 工程根目录的build.gradle

// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    ext.kotlin_version = "1.4.20"
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }

        // 该包所在的GitHub Repository地址
        maven { url 'https://maven.pkg.github.com/apqx/JetTools'
            credentials {
                username = "user_name"
                password = "your_token"
            }
        }
    }
    dependencies {
        classpath ‘com.android.tools.build:gradle:4.1.1’
        classpath ’org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version1‘

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        google()
        jcenter()

        // 该包所在的GitHub Repository地址
        maven { url 'https://maven.pkg.github.com/apqx/JetTools'
            credentials {
                username = "apqx"
                password = "your_token"
            }
        }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

在要使用该包的`Module`中：

```groovy
// Module的build.gradle

dependencies {
    implementation ‘org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version’
    implementation 'androidx.core:core-ktx:1.3.2'
    implementation 'androidx.appcompat:appcompat:1.2.0'
    implementation 'com.google.android.material:material:1.2.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.0.4'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.3.1'
    implementation 'androidx.navigation:navigation-ui-ktx:2.3.1'
    testImplementation 'junit:junit:4.+'
    androidTestImplementation 'androidx.test.ext:junit:1.1.2'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.3.0'
    // 使用该包，gradle会自动处理依赖问题
    implementation 'me.apqx.jettools:play:1.0.0'
}
```

## 一些限制

通过上面可以看到，不同于常见的`Maven`，`gradle`依赖`GitHub Packages`上的包是需要授权的，这种限制意味着它只适合应用在一些很小的圈子里，比如团队或个人的私有类库，如果在大范围内分享，这种授权限制就很不方便了。

还有一点是关于删除已发布的包，`GitHub`允许删除私有仓库的包，但不允许删除公共仓库的包，因为可能已经有其它项目正在使用。如果某个版本存在问题，正确的解决方法不是删除该包而是发布一个修复了问题的新版本包。

更多信息可以参见`Android Developers`对[Maven Publish Gradle plugin](https://developer.android.com/studio/build/maven-publish-plugin){: target="_blank" }的描述。
