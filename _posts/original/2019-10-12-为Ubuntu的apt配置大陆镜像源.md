---
layout: post
categories: original
title: "为Ubuntu的apt配置大陆镜像源"
author: 立泉
mention: Linux 包管理器 阿里云
date: 2019-10-12 +0800
description: 基于Debian的Linux发行版中可以使用apt高级包管理器来安装软件，其默认源在中国大陆的访问速度非常慢，所以有必要修改到最近的镜像源，阿里云提供的镜像是一个不错的选择。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_thumb.webp
tags: Code Ubuntu Linux APT 阿里云 镜像源
outdated: true
---

基于`Debian`的`Linux`发行版可以使用`apt(Advanced Packaging Tool)`高级包管理器安装软件。

```sh
# 比如安装jekyll，一个静态站点生成工具
sudo apt install jekyll
```

`apt`会从指定的`源`服务器上查找`jekyll`软件包，下载并安装，在`Software & Update`中可以看到系统当前使用的源是`Main server`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu" }

众所周知的网络原因，`Main server`在中国大陆的访问速度非常慢，有必要修改为国内的`镜像`源。`Ubuntu 18.04.3 LTS`点击`Download from`下拉列表，会发现系统提供很多大陆`源`，`阿里云`是一个不错的选择。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_source.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu" }

设置好后，在`Terminal`里更新一下包索引，可以看到`apt源`已经变成阿里云`镜像`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_terminal_apt_update_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu Terminal" }

## 手动配置

对于一些老版本`Ubuntu`，需要手动修改`/etc/apt/sources.list`文件来配置`apt源`，其实`Software & Update`本质也是修改这个文件，只是提供更直观的图形界面。

默认的`/etc/apt/sources.list`文件内容类似于如下格式，可能服务器地址会有不同，与安装`Ubuntu`时选择的国家和地区有关。

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

每一行都由3部分组成，定义一个`镜像`服务器的多个目录地址。

* 第1部分是`deb`或`deb-src`，分别表示直接通过`.deb包`安装和通过`源代码`安装。
* 第2部分是`源`服务器的`URL`根地址。
* 第3部分是`源`服务器的`URL`根地址之下的具体目录结构。

浏览器访问`http://cn.archive.ubuntu.com/ubuntu/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_root.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

进入`dists/`目录：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_dists.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

可以看到，每一个`Ubuntu`系统代号都有5个目录，比如`18.04`代号是`bionic`，对应`bionic/`、`bionic-backports/`、`bionic-proposed/`、`bionic-sercurity/`和`bionic-updates/`。

随便进入一个目录，`/bionic/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_bionic.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

可以看到`main/`、`universe/`、`multiverse/`、`retricted/`都是具体目录。

根据[官方文档](https://developer.aliyun.com/mirror/){: target="_blank" }，阿里云对应`Ubuntu 18.04`的`镜像`地址如下：

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

自定义`apt源`可以直接修改`/etc/apt/sources.list`文件，替换成以上地址。

```sh
# 修改系统文件前备份是个好习惯
sudo cp /etc/apt/sources.list /etc/apt/sources.list.back
sudo vim /etc/apt/sources.list
# 修改完成后，更新包索引
sudo apt update
```

`Ubuntu`也提供`/etc/apt/sources.list.d/`目录来存放用户自定义的`源`地址，可以不修改`/etc/apt/sources.list`而在`/etc/apt/sources.list.d/`目录下新建一个`aliyun.list`文件，把阿里云镜像地址复制进去即可。

```sh
# 创建aliyun.list文件，把阿里云的镜像地址复制进去
sudo vim /etc/apt/sources.list.d/aliyun.list
# 修改完成后，更新包索引
sudo apt update
```