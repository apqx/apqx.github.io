---
layout: post
categories: original
title: "部署GitHub Pages博客到私有服务器"
author: 立泉
mention: Jekyll HTTPS
date: 2020-09-14 +0800
description: 这个博客是托管在GitHub Pages上的，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，一些情况下甚至需要等待5秒以上才能打开，这让我无法接受。博客是我沉淀知识阅历的地方，应该在网络中触手可及，而非无意义的等待。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png
tags: Code GitHub Jekyll Blog HTTPS
---

这个博客是托管在`GitHub Pages`上的，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，一些情况下甚至需要等待5秒以上才能打开，这让我无法接受。博客是我沉淀知识阅历的地方，应该在网络中触手可及，而非无意义的等待。

## 镜像

前几年`GitHub Pages`并不是这样，当时我很满意才会把博客托管到这里，可惜物是人非，我也必须做一些尝试，尽可能提高一个`非备案域名`在大陆的访问速度。不错，一个普通博客，我不想备案，虽然微不足道，但这是我个人面对过度内容审查最后的坚持。不备案也就意味着无法使用大陆的`服务器`和`CDN`，而这两项恰恰是网站加速的最优途径，所以成年人的标志之一便是根据自己的好恶作出选择然后坦然面对后果。

为减少`GitHub`仓库容量，毕竟速度那么慢，我把其中的图片、视频资源都放到了阿里云的`对象存储OSS`上，这个只需实名，不用备案。关于费用，我看到很多人会选择一些小服务商的`OSS`，只是因为它们会提供一定的免费额度。但实际上阿里云的报价表只是看起来复杂，像我这种本来访问量就少的个人博客，流量并不大，账单每月也就几毛钱，充5元就可以用上好几年。

*2024年03月07日更新：注意[OSS可能被流量攻击引起的高额账单风险]({% link _posts/original/2024-03-07-解决阿里云OSS无CDN时的流量风险.md %}){: target="_blank" }。*

解决资源托管后，整个博客的速度瓶颈就只剩下对`GitHub`服务器本身的连接速度，而其在大陆没有数据中心，我又不能使用国内`CDN`，所以唯一可行的方法就是在一台靠近大陆的服务器上创建博客镜像，再把域名指向它。虽然要多付出一台`服务器`费用，但它确实解决了博客访问速度慢的问题，而且这台服务器不仅能用来托管博客，之后随着我的想法越来越多也会发挥更大的作用。

## 实施

`GitHub Pages`托管的博客本身是一个`Git`仓库，按`Jekyll`工程的目录要求进行配置。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png){: loading="lazy" class="clickable clickShowOriginalImg" alt="jekyll" }

其中，`_drafts`和`_posts`分别存放用`Markdown`格式撰写的草稿和文章，`assets`存放媒体资源，我已经把它们迁到了阿里云的`OSS`上，所以这里是空的。而`_includs`、`_layouts`、`css`、`font`、`js`则是和网站主题、布局、模版相关的东西，`Jekyll`需要它们才能将`Markdown`文本转换为静态`HTML`网页。

内容更改后，执行`git push`推到`GitHub`上，`Pages`会自动用`Jekyll`生成静态网页，然后`Serve`到指定域名下，就可以访问到博客了。创建博客镜像就是把这份代码`Push`到自己的`服务器`上，手动用`Jekyll`在`_site`目录下生成静态网页，再配置`Nginx`进行`Serve`即可。

我并不擅长`Java后端`和`Web编程`，但好在要做的事并不复杂，`服务器`安装`Nginx`后会生成默认配置文件`/etc/nginx/sites-available/default`，按如下方式修改：

```sh
server {
    # 未使用HTTPS时的配置，监听端口为80
    listen 80 default_server;
    listen [::]:80 ipv6only=on default_server;

    # 网站index.html的位置
    root /home/apqx/Code/apqx.github.io/_site;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    # 域名
    server_name mudan.me;

    location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =404;
    }
}
```

重启`Nginx`，就可以用`HTTP`访问到博客了。

```sh
sudo systemctl restart nginx
```

## HTTPS

现在借助`Let’s Encrypt`启用`HTTPS`已经非常简单，[cerbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx){: target="_blank" }是一个基于`Let’s Encrypt`为域名生成`SSL`证书并配置`Nginx`的工具，也支持为`Let’s Encrypt`只有90天有效期的证书自动续期。

```sh
# 安装cerbot
sudo snap install --classic certbot
# 按提示选择要加密的域名，生成证书签名，配置Nginx，启用SSL
# 证书目录为/etc/letsencrypt/live/[域名]/
# cerbot会自动执行证书更新
sudo certbot --nginx
```

按提示执行完成后，`cerbot`会自动更新`Nginx`配置来使用生成的证书，并启用`HTTPS`。

```sh
server {
    # 使用HTTPS时的配置，SSL监听端口为443
    # 启用HTTP/2
    listen 443 ssl http2; 
    listen [::]:443 ssl http2 ipv6only=on; 
    # SSL要使用的证书
    ssl_certificate /etc/letsencrypt/live/mudan.me/fullchain.pem; 
    # 密钥
    ssl_certificate_key /etc/letsencrypt/live/mudan.me/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf; 
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; 

    # 网站index.html的位置
    root /home/apqx/Code/apqx.github.io/_site;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    # 域名
    server_name mudan.me;

    location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =404;
    }
}
```

访问网站，看到`HTTPS`已经启用，证书由`Let’s Encrypt`签发，有效期90天。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/lets_encrypt.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ssl certificate" }

我使用的是`Google Cloud`台湾节点的服务器，延迟60ms，比`GitHub Pages`的平均300ms好很多，当然比不上离我最近的阿里云杭州节点的10ms，不过对于静态网站已经足够。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/ping_apqxme.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ping" }