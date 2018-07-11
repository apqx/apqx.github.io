---
layout: post
type: essy
title:  "在Ubuntu 18.04 中配置JDK环境"
author: APQX
date:   2018-06-20 18:41:38 +0800
categories: essy
headpic: /assets/ubuntu.jpg
---

# 在Ubuntu 18.04 中配置JDK环境

## APQX

## 2018年6月20日

我很喜欢Windows 10，但我想接触一些操作系统的基本原理，开源的Linux是最好的选择，由此，也开始了我的Ubuntu之旅。

2个月前，我组装了自己的第一个台式机，Ubuntu是首选操作系统，亲身使用过才知道“”

### 配置JAVA开发环境

在Oracle网站下载[JDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk10-downloads-4416644.html)文件

解压JDK到/usr/lib中

```
// 实际目录和文件名可能不同
sudo tar -xf /home/apqx/Downloads/jdk-10.0.1_linux-x64_bin.tar.gz /usr/lib
```
在/etc/profile.d目录下创建用于设置环境变量的脚本文件environment.sh

```
sudo vim /etc/profile.d/environment.sh
```

在创建的脚本文件中设置Java环境变量

```
#!/bin/sh
export JAVA_HOME=/usr/lib/jdk-10.0.1
export PATH=$PATH:$JAVA_HOME/bin
```

执行脚本

```
sh /etc/profile.d/environment.sh
```

检查环境变量是否设置成功

```
java --version
```

如果看到正确输出，说明设置正确，重新登录即可全局生效。