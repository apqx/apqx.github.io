---
layout: post
type: essy
title: "在GCE上搭建Shadowsocks的一些问题"
author: 立泉
date: 2019-07-18 +0800
description: 我一直觉得谷歌是一家很酷的公司，所以也很喜欢他们的产品，谷歌云也一样，只是价格么，相比别家，以个人使用的角度，的确算是偏贵的。
cover: 
categories: essy
tags: CS Google_Cloud VPS Shadowsocks
---

> 更新：有证据表明`GFW`已经可以精准识别`Shadowsocks`的流量特征，仅使用其作为工具可能导致服务器`端口/IP`被封禁，本文内容仅供参考。

`GCE`(Google Compute Engine)即谷歌计算引擎，是`Google Cloud`的一部分，其实就是云端服务器，最低`VPS`套餐每月5美元，除了北美地区的一些机房流量免费外，其它地区的流量是单独计费的，尤其是流向中国大陆的流量，价格几乎翻倍了。但是，亚洲台湾机房的速度非常快，延迟在`60ms`左右，相比大部分`VPS`供应商动辄`200ms`的延迟，优势非常大，且`Google Cloud`可以免费试用一年，薅了一年羊毛之后，是否继续使用，就要看各自的需求了。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_price.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

和`Vultr`的[配置方式]({% post_url 2018-12-09-倚晴天，红杏窥墙 %}){: target="_blank" }不同，在`GCE`上搭建`Shadowsocks`有一些细节问题需要注意。

# 防火墙

`Google`可能会限制一些端口的流量入站行为，影响`Shadowsocks`的运行，所以首先要配置一个允许所有入站端口的防火墙规则，在`VPC network`->`Firewall rules`中，点击`CREATE FIREWALL RULE`，创建一个名为`allow-all-in`的规则。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_firewall.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

# 创建实例

在`Compute Engine`->`VM instances`中，点击`CREATE INSTANCE`，地区、套餐和操作系统按需求选择，在`Network`->`Network tags`里填写上文创建的`allow-all-in`规则，其余项默认即可，点击`Create`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_instance.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

# 安装&配置

在`VM instance`里找到上文创建的实例，点击`Connect`里的`SSH`

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_connect.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

会在新的浏览器窗口里建立和服务器的`SSH`连接

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_ssh.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

切换到`root`用户

```sh
sudo su
```

安装`Shadowsocks`

```sh
# 更新apt索引
apt update
# 安装
apt install shadowsocks
```

配置`Shadowsocks`的默认配置文件

```sh
vim /etc/shadowsocks/config.json
```

注意这里的`server`填的不是`VPS`的`公网IP`，而是`VPS`在`GCE`中的`内网IP`，这个和其它`VPS`提供商的配置都不同

```json
{ 
	// 自定义
	"server":"VPS在GCE的内网IP地址", 
	// 自定义
	"server_port":服务器端口（1000~65535）, 
 	"local_address": "127.0.0.1", 
	"local_port":1080, 
	// 自定义
	"password":"自定义密码", 
	"timeout":300, 
	// 加密方式
	"method":"aes-256-cfb", 
	"fast_open": false,
	"workers": 1,
	"prefer_ipv6": false
} 
```

启动`Shadowsocks`

```sh
/etc/init.d/shadowsocks start
```

在客户端配置好服务器信息，即可连接到这台`Shadowsocks`服务器。但是，如果上面的配置信息里的`server`填的是`VPS公网IP`，会出现，客户端无法连接。

查看日志文件
sh
```
vim /var/log/shadowsocks
```

发现以下错误

```sh
INFO: loading config from /etc/shadowsocks/config.json
Traceback (most recent call last):
  File "/usr/bin/ssserver", line 11, in <module>
    load_entry_point('shadowsocks==2.9.0', 'console_scripts', 'ssserver')()
  File "/usr/lib/python2.7/dist-packages/shadowsocks/server.py", line 74, in main
    tcp_servers.append(tcprelay.TCPRelay(a_config, dns_resolver, False))
  File "/usr/lib/python2.7/dist-packages/shadowsocks/tcprelay.py", line 733, in __init__
    server_socket.bind(sa)
  File "/usr/lib/python2.7/socket.py", line 228, in meth
    return getattr(self._sock,name)(*args)
socket.error: [Errno 99] Cannot assign requested address
```

[搜索一番](https://www.chenweikang.top/?p=679){: target="_blank" }，原因应该是`GCE`的`VPS`自己默认做了`内网映射`，所以只需把`server`改成`内网IP`即可。

优化网络方面，启用`BBR`算法的方式，和其它`VPS`一样。

# 静态IP

`GCE`给`VPS`默认分配的是动态`IP`，即`IP`地址可能会变化，我们当然希望它是不变的，因此需要在`VPC network`->`External IP addresses`里找到该`VPS`的`IP`，把它的`Type`改为`Static`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190718/gc_ip.jpg){: loading="lazy" class="clickable" onclick="clickShowOriginalImg(event)" alt="pic"}

注意看上面有一个`RESERVE STATIC ADDRESS`选项，它可以申请一个新的`静态IP`，然后把它绑定到任意的`实例`上，这意味着，对`科学上网`而言，经常面临的`IP`被封问题，可以通过更换`VPS`的`IP`来解决，这也是`Google Cloud`相对其它供应商的又一个大的优势。