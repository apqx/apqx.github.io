---
layout: post
type: original
categories: original
title: "为Ubuntu配置apt源服务器地址"
author: 立泉
date: 2019-10-12 +0800
description: 一直觉得大陆像是一个互联网孤岛，很多网络服务都要切换到本地平台，对Ubuntu的源服务器选择，显然离我最近的阿里云速度更快。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_settings_apt.png
tags: CS Ubuntu Linux
---

在基于`Debian`的`Linux`发行版中，可以使用`apt(Advanced Packaging Tool)`高级包管理器来直接安装软件。

```sh
# 比如安装jekyll，这是一个基于Markdown的静态网站生成工具
sudo apt install jekyll
```

`apt`会自动从指定的源服务器上查找`jekyll`软件包，下载并安装，在`Software & Update`中，可以看到系统当前使用的源是`Main server`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_settings_apt_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="ubuntu" }

这个`Main server`在中国大陆的访问速度非常慢，所以必须修改为最近的`源镜像服务器`。我使用的是`Ubuntu 18.04.3 LTS`，点击`Download from`下拉列表，会发现系统已经提供了很多大陆的源服务器镜像，比如`阿里云`就是一个不错的选择。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_settings_apt_source.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="ubuntu" }

设置好后，在`Terminal`里更新一下包索引，可以看到，`apt源`已经变成阿里云的镜像地址了。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_terminal_apt_update_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="ubuntu terminal" }

# 手动配置

对于一些老版本的`Ubuntu`，可能就需要自己去修改`/etc/apt/sources.list`文件来配置`apt源`了，其实`Software & Update`本质上也是修改的这个文件，只是提供了一种更直观的图形化界面。

默认的`/etc/apt/sources.list`文件内容是类似于如下格式的，可能服务器地址有些不同，和安装`Ubuntu`时选择的国家和地区有关。

```sh
main multiverse #Added by software-properties

## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
## team. Also, please note that software in universe WILL NOT receive any
## review or updates from the Ubuntu security team.
deb http://cn.archive.ubuntu.com/ubuntu/ bionic universe
# deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic universe
deb http://cn.archive.ubuntu.com/ubuntu/ bionic-updates universe
# deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic-updates universe

## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu 
## team, and may not be under a free licence. Please satisfy yourself as to 
## your rights to use the software. Also, please note that software in 
## multiverse WILL NOT receive any review or updates from the Ubuntu
## security team.
deb http://cn.archive.ubuntu.com/ubuntu/ bionic multiverse
# deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic multiverse
deb http://cn.archive.ubuntu.com/ubuntu/ bionic-updates multiverse
# deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic-updates multiverse

## N.B. software from this repository may not have been tested as
## extensively as that contained in the main release, although it includes
## newer versions of some applications which may provide useful features.
## Also, please note that software in backports WILL NOT receive any review
## or updates from the Ubuntu security team.
deb http://cn.archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse #Added by software-properties

## Uncomment the following two lines to add software from Canonical's
## 'partner' repository.
## This software is not part of Ubuntu, but is offered by Canonical and the
## respective vendors as a service to Ubuntu users.
# deb http://archive.canonical.com/ubuntu bionic partner
# deb-src http://archive.canonical.com/ubuntu bionic partner

deb http://security.ubuntu.com/ubuntu bionic-security main restricted
deb-src http://security.ubuntu.com/ubuntu bionic-security universe restricted main multiverse #Added by software-properties
deb http://security.ubuntu.com/ubuntu bionic-security universe
# deb-src http://security.ubuntu.com/ubuntu bionic-security universe
deb http://security.ubuntu.com/ubuntu bionic-security multiverse
# deb-src http://security.ubuntu.com/ubuntu bionic-security multiverse
```

把注释去掉，调整一下格式，能看得更清楚一点：

```sh
deb http://cn.archive.ubuntu.com/ubuntu/ bionic universe multiverse
deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic universe multiverse

deb http://security.ubuntu.com/ubuntu bionic-security main restricted universe multiverse
deb-src http://security.ubuntu.com/ubuntu bionic-security main restricted universe multiverse 

deb http://cn.archive.ubuntu.com/ubuntu/ bionic-updates universe multiverse
deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic-updates universe multiverse

deb http://cn.archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://cn.archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse
```

每一行都由3部分组成：

* 第1部分是`deb`或`deb-src`，分别表示直接通过`.deb包`安装和通过`源文件`安装。
* 第2部分是源服务器的`URL`根地址。
* 第3部分是源服务器的`URL`根地址之下的具体目录结构。

实际每一行，都定义了一个镜像服务器的一个或多个目录地址。

浏览器访问`http://cn.archive.ubuntu.com/ubuntu/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_apt_cnserver_root.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

进入`dists/`目录：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_apt_cnserver_dists.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

可以看到，对每一个`Ubuntu`系统代号，都有5个目录，比如`18.04`代号是`bionic`，就对应`bionic/`, `bionic-backports/`, `bionic-proposed/`, `bionic-sercurity/`, `bionic-updates/`，随便进入一个目录，`/bionic/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20191012/ubuntu_apt_cnserver_bionic.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

`main/`, `universe/`, `multiverse/`, `retricted/`都是具体的目录，这样看来，就可以理解`/etc/apt/sources.list`每一行的含义了。

根据[官网](https://developer.aliyun.com/mirror/){: target="_blank" }，阿里云对应`Ubuntu 18.04`的镜像源地址如下：

```sh
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
```

如果要自定义`apt源`，可以直接修改`/etc/apt/sources.list`文件，用以上内容替换掉原内容即可。

```sh
# 修改系统文件前备份是个好习惯
sudo cp /etc/apt/sources.list /etc/apt/sources.list.back
sudo vim /etc/apt/sources.list
# 修改完成后，更新包索引
sudo apt update
```

其实`Ubuntu`也提供了一个`/etc/apt/sources.list.d/`目录来存放用户自定义的源地址，所以，可以不修改`/etc/apt/sources.list`而在`/etc/apt/sources.list.d/`目录下新建一个`aliyun.list`文件，把阿里云的镜像地址复制进去即可。

```sh
# 创建aliyun.list文件，并把阿里云的镜像地址复制进去
sudo vim /etc/apt/sources.list.d/aliyun.list
# 修改完成后，更新包索引
sudo apt update
```