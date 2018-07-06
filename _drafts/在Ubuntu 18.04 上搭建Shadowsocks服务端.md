---
layout: post
type: essy
title:  "在Ubuntu 18.04 上搭建Shadowsocks服务端"
author: APQX
date:   2018-05-28 18:41:38 +0800
categories: essy
headpic: /assets/ubuntu.jpg
---

# 在Ubuntu 18.04 上搭建Shadowsocks服务端

## APQX

## 2018年5月28日

### Shadowsocks是什么

> **Shadowsocks** is an open-source encrypted proxy project, widely used in mainland China to circumvent [Internet censorship](https://en.wikipedia.org/wiki/Internet_censorship_in_China). It was created in 2012 by a Chinese programmer named "clowwindy", and multiple implementations of the protocol have been made available since.[[4]](https://en.wikipedia.org/wiki/Shadowsocks#cite_note-github-init-4)[[5]](https://en.wikipedia.org/wiki/Shadowsocks#cite_note-github-ports-5) Typically, the client software will open a socks5 proxy on the machine it is run, which internet traffic can then be directed towards, similarly to an [SSH tunnel](https://en.wikipedia.org/wiki/SSH_tunnel).[[6]](https://en.wikipedia.org/wiki/Shadowsocks#cite_note-6) Unlike an SSH tunnel, shadowsocks can also proxy UDP traffic.

### 为什么需要Shadowsocks

自由的访问网络在21世纪的中国大陆被称为“科学上网”，Shadowsocks是一种流行的穿墙工具。

### 需要准备些什么

搭建自己的Shadowsocks服务器，需要以下：

* 海外VPS或实体Server，我自用的是[Vultr](https://www.vultr.com/?ref=7355474)
* Linux基础

### 如何搭建

* 使用SSH连接到购买的服务器

  Windows平台可以使用[Xshell](https://www.netsarang.com/products/xsh_overview.html)，Linux平台可以直接使用`ssh`命令

  ```
  ssh username@host
  ```

  按提示输入密码，即可连接

* 安装Shadowsocks

  对于Ubuntu 18.04 及以上版本

  ```
  sudo apt install shadowsocks
  ```

  验证是否安装成功

  ```
  ssserver --help
  ```

* 配置参数

  在任意路经下创建json格式的配置文件

  ```
  vim /home/username/ss.json
  ```

  内容如下
  ```
  { 
  	"server":"VPS的ip地址", 
  	"server_port":自定义端口（1000~65535）, 
  	"local_address": "127.0.0.1", 
  	"local_port":1081, 
  	"password":"自定义密码", 
  	"timeout":300, 
  	"method":"aes-256-cfb", 
  	"fast_open": false 
  } 
  ```

* 启动服务

  ```
  ssserver -c /home/username/ss.json
  ```

* 配置开机自启动

  在`/etc/profile.d/`目录下新建开机自执行脚本

  ```
  sudo vim /etc/profile.d/doWhenLogin.sh
  ```

  编写内容如下

  ```
  \#!/bin/sh
  sserver -c /home/username/ss.json 1>/dev/null 2>&1 &
  ```

* 开启BBR加速

  BBR算法已经在Linux内核4.9及以上版本中包括，但并没有默认开启。

  对于 Ubuntu 18.04 及以上版本，内核已在4.9之上，可以直接开启此功能。

  ```
  modprobe tcp_bbr
  echo "tcp_bbr" >> /etc/modules-load.d/modules.conf
  echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
  echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
  sysctl -p
  ```
  
* 重启以验证是否正确配置

  ```
  reboot
  ```