---
layout: post
categories: original
title: "为 Ubuntu 的 APT 配置大陆镜像源"
author: 立泉
mention: Linux 包管理器 阿里云
date: 2019-10-12 +0800
description: 基于 Debian 的 Linux 发行版可使用 APT 包管理器安装软件，其默认源在中国大陆的访问速度非常慢，有必要修改为最近的镜像源，阿里云镜像是一个不错的选择。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_thumb.webp
tags: Code Ubuntu Linux APT 阿里云 镜像源
outdated: true
---

基于 Debian 的 Linux 发行版可使用 APT（Advanced Packaging Tool）高级包管理器安装软件。

```sh
# 比如安装 Jekyll，一个静态站点生成工具
sudo apt install jekyll
```

APT 会从源服务器查找 Jekyll 软件包下载安装，在 Software & Update 中看到系统当前使用的是 Main server。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu" }

众所周知 Main server 在中国大陆的访问速度非常慢，有必要修改为国内镜像源。Ubuntu 18.04.3 LTS 点击 Download from 下拉列表发现系统提供很多大陆源，阿里云是一个不错的选择。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_settings_apt_source.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu" }

设置好后在 Terminal 里更新一下包索引，看到 APT 源已经变成阿里云镜像。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_terminal_apt_update_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ubuntu Terminal" }

## 手动配置

一些老版本 Ubuntu 需要手动修改`/etc/apt/sources.list`文件来配置 APT 源，Software & Update 本质也是修改这个文件，只是提供更直观的图形界面。

`/etc/apt/sources.list`的默认内容类似如下格式，可能服务器地址会有不同，与安装 Ubuntu 时选择的国家和地区有关。

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

把注释去掉，调整一下格式看得更清楚：

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

每一行都由 3 部分组成，定义一个镜像服务器的多个目录地址。

* 第1部分是 deb 或 deb-src，分别表示直接通过 .deb 包安装和通过源代码安装。
* 第2部分是源服务器的 URL 根地址。
* 第3部分是源服务器的 URL 根地址之下的具体目录结构。

浏览器访问`http://cn.archive.ubuntu.com/ubuntu/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_root.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

进入`dists/`目录：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_dists.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

可以看到，每一个 Ubuntu 系统代号都有 5 个目录，比如 18.04 代号 bionic，对应`bionic/`、`bionic-backports/`、`bionic-proposed/`、`bionic-sercurity/`和`bionic-updates/`。

随便进入一个目录`/bionic/`：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20191012/ubuntu_apt_cnserver_bionic.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="apt" }

里面`main/`、`universe/`、`multiverse/`、`retricted/`都是具体目录。

根据[官方文档](https://developer.aliyun.com/mirror/){: target="_blank" }，阿里云对应 Ubuntu 18.04 的镜像地址如下：

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

自定义 APT 源可直接修改`/etc/apt/sources.list`文件，替换成以上地址。

```sh
# 修改系统文件前备份是个好习惯
sudo cp /etc/apt/sources.list /etc/apt/sources.list.back
sudo vim /etc/apt/sources.list
# 修改完成后，更新包索引
sudo apt update
```

Ubuntu 也提供`/etc/apt/sources.list.d/`目录来存放用户自定义的源地址，可不修改`/etc/apt/sources.list`而在`/etc/apt/sources.list.d/`目录下新建一个`aliyun.list`文件，把镜像地址复制进去。

```sh
# 创建 aliyun.list 文件，把阿里云的镜像地址复制进去
sudo vim /etc/apt/sources.list.d/aliyun.list
# 修改完成后，更新包索引
sudo apt update
```