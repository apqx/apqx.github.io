---
layout: post
categories: original
title: "为Ubuntu配置JDK环境变量"
author: 立泉
mention: $PATH EXPORT
date: 2018-04-20 +0800
description: 我经常会产生一些有意思的想法，对很多事情感到好奇，习惯了图形化交互高度成熟的Windows 10，有点想尝试一下传说中“纯手工”操作的Linux，正好手里刚组了人生的第一个台式机，Ubuntu自然就成了首选操作系统。
cover: 
tags: Code Java Ubuntu Linux JDK
overtime: true
---

我经常会产生一些有意思的想法，对很多事情感到好奇，习惯了图形化交互高度成熟的`Windows 10`，有点想尝试一下传说中“纯手工”操作的`Linux`。正好手里刚组了人生的第一个台式机，`Ubuntu`自然就成了首选操作系统。

作为一个10年的`Windows`用户，翻遍`Ubuntu`的`Settings`也没有发现和`Environment Variables`相关的选项，设置界面比起`Windows`的控制面板只能用“简陋”来形容。在这一刻我好像突然明白了为什么`Windows`能占领民用桌面操作系统市场，真的是“同行的衬托”，相比`Linux`的高冷，`Windows`对几乎所有操作都有提供图形界面，动动鼠标就能完成的事，普通人谁会想去面对那个“恐怖”的`Terminal`呢。

参考几篇文章，在`Ubuntu`中配置`环境变量`无非两种方式，直接修改`环境变量`配置文件`/etc/environment`，或者使用`export`命令将新的`环境变量`插入到系统设置中。

## 安装JDK

在`Oracle`网站下载[JDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk10-downloads-4416644.html)文件，解压到`/usr/lib`中：

```sh
# 实际目录和文件名可能不同
sudo tar -xf /home/apqx/Downloads/jdk-10.0.1_linux-x64_bin.tar.gz /usr/lib
```

## 直接修改environment文件

`Ubuntu`的`环境变量`配置文件是`/etc/environment`，可以直接将`JDK`目录写到这个文件中，对所有用户生效。

打开文件：

```sh
sudo vim /etc/environment
```

里面的内容是类似这样的：

```sh
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
```

将`JDK`目录添加到`PATH`中：

```sh
JAVA_HOME="/usr/lib/jdk-10.0.1/"
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/jdk-10.0.1/bin"
```

要注意的是，`/etc/environment`中不能使用`$`来引用已有环境变量，也不能使用`export`命令，即必须填写绝对路径，就像上面那样。

加载修改后的文件，使其在当前`Terminal`立即生效，全局生效则需要重新登录。

```sh
source /etc/environment
```

检查是否配置成功：

```sh
echo $JAVA_HOME
echo $PATH
```

## 使用export命令

在`Terminal`中输入：

```sh
# 创建一个名为 JAVA_HOME 的变量
export JAVA_HOME=/usr/lib/jdk-10.0.1
# 把该变量对应的路径添加到环境变量 PATH 中
export PATH=$PATH:$JAVA_HOME/bin
```

即定义了一个`JAVA_HOME`环境变量，并将其路径添加到系统环境变量`PATH`之后，此时执行：

```sh
echo $PATH
```

就可以看到已经添加成功了，但是这种方式设置的`环境变量`只对当前`Terminal`及其衍生`Terminal`有效。解决方法是在用户登录时自动在根`Terminal`中执行`export`命令，这样才是全局生效的。

`Linux`中有一个特殊的目录`/etc/profile.d/`，此目录下的脚本文件都会在`用户登录`时自动被执行。当然`Linux`的`开机`并不等于`用户登录`，所以这种方式和`开机自启`还是有一些区别，但对于设置`环境变量`来说足够了。

在`/etc/profile.d`目录下创建用于设置`环境变量`的脚本文件`environment.sh`：

```sh
sudo vim /etc/profile.d/environment.sh
```

在创建的脚本文件中设置`JDK`的`环境变量`：

```sh
#!/bin/sh
# 创建一个名为 JAVA_HOME 的变量
export JAVA_HOME=/usr/lib/jdk-10.0.1
# 把该变量对应的路径添加到环境变量 PATH 中
export PATH=$PATH:$JAVA_HOME/bin
```

执行脚本：

```sh
sh /etc/profile.d/environment.sh
```

检查环境变量是否设置成功：

```sh
java --version
```

如果看到正确输出，说明设置成功，重新登录即可全局生效。

## 使用apt安装OpenJDK

上面的方式是手动下载`Oracle JDK`，手动安装，然后手动配置环境变量，步骤清晰，但是有一点麻烦。如果使用`Open JDK`的话，只需要一条指令，下载、安装、环境变量的配置便会自动完成。

```sh
# 使用Ubuntu的包管理器安装Java 8版本的OpenJDK
sudo apt install openjdk-8-jdk
```

其实，随着`Ubuntu`的版本迭代，越来越多原本复杂的手工操作都会被更加方便快捷的自动化方式取代。对用户而言，`Linux`的亲和性也在这一不断完善的过程中愈加展现出更多的吸引力。