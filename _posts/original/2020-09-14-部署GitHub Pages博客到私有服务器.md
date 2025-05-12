---
layout: post
categories: original
title: "部署GitHub Pages博客到私有服务器"
author: 立泉
mention: Jekyll HTTPS
date: 2020-09-14 +0800
description: 博客托管在GitHub Pages上，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，有时甚至需要等待5秒以上才能打开，这让我无法接受。博客是沉淀知识阅历的地方，应该触手可及，而非无意义等待。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png
tags: Code GitHub Jekyll Blog HTTPS 云计算 阿里云 OSS 对象存储
---

博客托管在`GitHub Pages`上，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，有时甚至需要等待5秒以上才能打开，这让我无法接受。博客是沉淀知识阅历的地方，应该触手可及，而非无意义等待。

## 镜像

几年前`GitHub Pages`并不是这样，当时我很满意才会把博客托管给它，可惜物是人非，我必须做些尝试尽可能提高一个`非备案域名`在大陆的访问速度。不错，一个普通博客，我不想备案，虽然微不足道，但这是我面对过度内容审查最后的坚持。不备案意味着无法使用大陆的`服务器`和`CDN`，而这两项正是网站加速的最优途径，所以成年人的标志之一便是根据自己的好恶作出选择然后坦然面对后果。

为减少`GitHub`仓库容量，毕竟速度那么慢，我把网页之外的资源都放在阿里云杭州节点的`OSS对象存储`上，这个只需实名无须备案。关于费用，很多人会因为“免费额度”选择一些小服务商的`对象存储`，但实际上阿里云的报价表只是看起来复杂，对流量不大的个人博客，账单每月其实不过几毛钱，充5元已经是“巨款”。

*2024年03月07日更新：注意[OSS可能被流量攻击引起的高额账单风险]({% link _posts/original/2024-03-07-解决阿里云OSS无CDN时的流量风险.md %}){: target="_blank" }。*

解决资源托管后，瓶颈只剩下对`GitHub`服务器本身的连接速度，而其在大陆没有数据中心，我又不能使用国内`CDN`，所以唯一可行的方法是在一台靠近大陆的服务器上创建博客镜像，把域名指向它。付出一台`服务器`费用解决访问速度问题，承载博客之外，随着我的想法越来越多它也会发挥更大作用。

## 实施

`GitHub Pages`托管的博客本身是一个`Git`仓库，`Jekyll`工程的目录结构如下：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png){: loading="lazy" class="clickable clickShowOriginalImg" alt="jekyll" }

其中，`_drafts`和`_posts`分别存放用`Markdown`格式撰写的草稿和文章，`assets`存放媒体资源，已经把它们迁移到阿里云`OSS`上，所以这里是空的。`_includes`、`_layouts`、`css`、`font`和`js`是与网站布局、样式、模版相关的东西，`Jekyll`需要借助它们将`Markdown`文本转换为静态`HTML`网页。

内容更改后`Push`到`GitHub`上，`Pages`会自动用`Jekyll`生成静态站点，然后`Serve`到指定域名下。创建博客镜像就是把这份代码`Push`到自己的`服务器`上，手动`Build`在`_site`目录生成静态网页，再配置`Nginx`进行`Serve`。

我并不擅长`Linux`，好在要做的事不复杂，`服务器`安装`Nginx`后会生成默认配置文件`/etc/nginx/sites-available/default`，按如下方式修改：

```sh
server {
    # HTTP 监听 80 端口
    # ipv4
    listen 80 default_server;
    # ipv6
    listen [::]:80 default_server;

    # 域名，若无域名则使用 localhost
    server_name mudan.me;

    # 网站 index.html 的位置
    root /home/apqx/Code/apqx.github.io/_site;

    # 入口
    index index.html index.htm index.nginx-debian.html;

    # 404 错误页面
    error_page 404 /404.html;

    location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =404;
    }
}
```

重启`Nginx`就可以用`HTTP`访问到博客。

```sh
sudo systemctl restart nginx
```

## HTTPS

如今借助`Let’s Encrypt`启用`HTTPS`已经非常简单，[Certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx){: target="_blank" }是一个基于`Let’s Encrypt`为域名生成`SSL`证书并配置`Nginx`的工具，同时支持为只有90天有效期的证书自动续期。

```sh
# 安装 Certbot
sudo snap install --classic certbot
# 按提示选择要加密的域名，生成证书签名，配置 Nginx，启用 SSL
# 证书目录为 /etc/letsencrypt/live/[域名]/
# Certbot 会自动执行证书更新
sudo certbot --nginx
```

按提示执行完成，`Certbot`会自动更新`Nginx`配置以使用生成的证书：

```sh
server {
	# 网站 index.html 的位置
	root /home/apqx/Code/apqx.github.io/_site;

	# 入口
	index index.html index.htm index.nginx-debian.html;

	# 404错误页面
   	error_page 404 /404.html;
    
    # 域名
	server_name mudan.me;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}

    # 监听 443 端口的 HTTPS
    # ipv4
    listen 443 ssl; # managed by Certbot
    # ipv6
	listen [::]:443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mudan.me/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mudan.me/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
	# 监听 80 端口的 HTTP，跳转 HTTPS
    if ($host = mudan.me) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80 default_server;
    listen [::]:80 default_server;
    server_name mudan.me;
    return 404; # managed by Certbot
}
```

访问网站，可以看到`HTTPS`已经启用，证书由`Let’s Encrypt`签发，有效期90天。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/lets_encrypt.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ssl certificate" }

这台`Google Cloud`台湾节点的服务器网络延迟约60ms，比`GitHub Pages`平均300ms好很多，当然比不上离我最近的阿里云杭州节点的10ms，但对静态博客已经足够。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/ping_apqxme.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ping" }