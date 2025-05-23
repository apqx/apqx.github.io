---
layout: post
categories: original
title: "为Ubuntu配置JDK环境变量"
author: 立泉
mention: $PATH EXPORT
date: 2018-04-20 +0800
description: 经常产生一些有意思的想法，对很多事情感到好奇，习惯图形化交互高度成熟的`Windows 10`，有点想尝试传说中“纯手工”操作的`Linux`。正好手里刚组了人生第一个台式机，`Ubuntu`自然是首选操作系统。
cover: 
tags: Code Java Ubuntu Linux JDK
outdated: true
---

经常产生一些有意思的想法，对很多事情感到好奇，习惯图形化交互高度成熟的`Windows 10`，有点想尝试传说中“纯手工”操作的`Linux`。正好手里刚组了人生第一个台式机，`Ubuntu`自然是首选操作系统。

作为一个10年`Windows`用户，翻遍`Ubuntu`的`Settings`也没有发现和`Environment Variables`相关的选项，设置界面比起`Windows`控制面板只能用“简陋”形容。这一刻我好像明白为什么`Windows`能占领民用桌面操作系统市场，真的是“同行衬托”。相比`Linux`的高冷，`Windows`对几乎所有操作都有提供图形界面，动动鼠标就能完成的事，普通人谁会想去面对那个“恐怖”的`Terminal`。

参考几篇文章，`Ubuntu`配置`环境变量`无非两种方式，直接修改`环境变量`配置文件`/etc/environment`，或者使用`export`命令将新`环境变量`插入系统。

## 安装JDK

在`Oracle`网站下载[JDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk10-downloads-4416644.html)文件，解压到`/usr/lib`中：

```sh
# 实际目录和文件名可能不同
sudo tar -xf /home/apqx/Downloads/jdk-10.0.1_linux-x64_bin.tar.gz /usr/lib
```

## 修改environment文件

`Ubuntu`的`环境变量`配置文件是`/etc/environment`，将`JDK`目录写入其中，对所有用户生效。

```sh
sudo vim /etc/environment
```

内容类似这样：

```sh
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
```

创建`JAVA_HOME`环境变量，并将`JDK`目录添加进`PATH`：

```sh
JAVA_HOME="/usr/lib/jdk-10.0.1/"
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/jdk-10.0.1/bin"
```

注意`/etc/environment`中不能使用`$`来引用已有环境变量，也不能使用`export`命令，必须填写绝对路径。

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

即定义一个`JAVA_HOME`环境变量，并将其路径添加到系统环境变量`PATH`之后，此时执行：

```sh
echo $PATH
```

可以看到已经添加成功，但这种方式设置的`环境变量`只对当前`Terminal`及衍生`Terminal`有效。解决方法是在用户登录时自动执行`export`命令，这样才能全局生效。

`Linux`有一个特殊的目录`/etc/profile.d/`，此目录下的脚本文件都会在`用户登录`时自动被执行。

在`/etc/profile.d`目录下创建用于设置`环境变量`的脚本文件`environment.sh`：

```sh
sudo vim /etc/profile.d/environment.sh
```

写入`JDK`的`环境变量`：

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

重新登录即可全局生效。

## apt安装OpenJDK

上面的方式是手动下载`Oracle JDK`，手动安装，然后手动配置环境变量，步骤清晰，但很麻烦。如果使用`Open JDK`则只需一条指令，下载、安装、环境变量的配置会自动完成。

```sh
# 使用Ubuntu的包管理器安装Java 8版本的OpenJDK
sudo apt install openjdk-8-jdk
```

随着`Ubuntu`版本迭代，越来越多原本复杂的手工操作都会被更方便快捷的自动化方式取代。这对普通用户无疑是好迹象，桌面版`Linux`在逐渐完善的过程中会展现出更多亲和性，尝鲜之外不妨试试做主力机使用，或许比`Windows`更得心应手。