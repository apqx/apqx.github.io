---
layout: post
categories: original
title: "将GitHub Pages托管的博客部署到第三方服务器"
author: 立泉
mention: Jekyll HTTPS
date: 2020-09-14 +0800
description: 这个博客是托管在GitHub Pages上的，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，一些情况下甚至需要等待5秒以上才能打开，这是我无法接受的。正如博客之名“立泉の写字板”，这里是我沉淀知识和阅历的地方，应该在互联网上触手可及，而非无意义的等待。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png
tags: CS GitHub Jekyll Blog HTTPS
---

这个博客是托管在`GitHub Pages`上的，不是我的错觉，它在大陆的访问速度正变得越来越不稳定，一些情况下甚至需要等待5秒以上才能打开，这是我无法接受的。正如博客之名“立泉の写字板”，这里是我沉淀知识和阅历的地方，应该在互联网上触手可及，而非无意义的等待。

## 镜像

我记得前几年`GitHub Pages`并不是这个样子，至少当时我很满意才会把博客托管到这里，可惜物是人非，我也开始做一些尝试，尽可能提高一个`非备案域名`在大陆的访问速度。不错，一个普普通通的博客，我不想备案，虽然微不足道，但这也是我个人面对过度内容审查最后的倔强了。不备案也就意味着无法使用大陆的`服务器`和`CDN`，而这两项恰恰是网站加速的最优途径，所以，成年人的标志之一便是根据自己的好恶作出选择然后坦然面对后果。

为减少`GitHub`仓库容量，毕竟速度那么慢，我把博客里的图片、视频资源都放到了阿里云的`对象存储OSS`上，这个只需实名，不用备案。关于费用，我看到很多人会选择一些小服务商的`OSS`，只是因为它们提供了一定的免费额度，实际上阿里云的报价表只是看起来复杂，如我这种本来访问量就少的个人博客，流量并不大，账单每月也就几毛钱，充个5元就可以用上好几年。

*2024年03月07日更新：注意[OSS可能被流量攻击引起的高额费用风险]({% link _posts/original/2024-03-07-解决阿里云OSS无CDN时的流量风险.md %}){: target="_blank" }。*

解决资源托管后，整个博客的速度瓶颈就只剩下对`GitHub`服务器本身的连接速度了，而其在大陆没有数据中心，所以这个不使用`CDN`没办法优化，而我又不能使用`CDN`，所以唯一可行的方法就是在一台靠近大陆的服务器上创建博客镜像，再把我的域名指向它。虽然要多付出一台`服务器`的费用，也看起来多此一举，但它确实解决了博客访问速度慢的问题，而且这台服务器不仅仅能用来托管博客，之后随着我的一些想法越来越多也会发挥更大的作用。

## 实施

`GitHub Pages`的博客方案其实很简单，整个博客本身是一个`Git`仓库，按`Jekyll`工程的目录要求进行配置。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/jekyll_project.png){: loading="lazy" class="clickable clickShowOriginalImg" alt="jekyll" }

其中，`_drafts`和`_posts`分别存放用`MarkDown`格式撰写的草稿和文章，`assets`存放一些媒体资源，我已经把它们迁到了阿里云的`OSS`上，所以这里是空的。而`_includs`、`_layouts`、`css`、`font`、`js`则是和网站的主题、布局、模版相关的东西，`Jekyll`需要使用它们才能将`MarkDown`文本转换为静态`HTML`网页。

内容更改后，只需执行`git push origin`把内容推到`GitHub`上，`Pages`会自动用`Jekyll`生成静态网页，然后`Serve`，这样就可以访问到博客了。而创建博客镜像，要做的就是把一份同样的代码`push`到自己的`服务器`上，手动用`Jekyll`在`_site`目录下生成静态网页，再配置`Nginx`进行`Serve`即可。而且`jekyll serve`启动后会监听文件变化，每次修改只要`push`，就会像`Pages`一样自动生成更新后的网页，非常方便。

我并不擅长`Java后端`和`Web编程`，但好在要做的事并不复杂，在`服务器`上安装`Nginx`后会生成默认的配置文件`/etc/nginx/sites-available/default`，按如下方式修改：

```sh
server {
    # 未使用https时的配置，监听端口为80
    listen 80 default_server;
    # ipv6
    listen [::]:80 ipv6only=on default_server;

    # 网站index.html的位置
    root /home/apqx/Code/apqx.github.io/_site;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    # 域名
    server_name apqx.me;

    location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =404;
    }
}
```

然后重启`nginx`：

```sh
sudo systemctl restart nginx
```

就可以用`HTTP`访问到博客了。

## HTTPS

现在借助`Let’s Encrypt`启用`HTTPS`已经非常简单，[cerbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx){: target="_blank" }是一个基于`Let’s Encrypt`为域名生成`SSL`证书并配置`Nginx`的工具，也支持为`Let’s Encrypt`只有90天有效期的证书自动续期。

```sh
# 安装cerbot
sudo snap install --classic certbot
# 按提示选择要加密的域名，会自动生成证书签名，自动配置nginx的配置文件，启用ssl加密
# 证书目录为/etc/letsencrypt/live/[域名]/
# cerbot会自动执行证书更新
sudo certbot --nginx
```

按提示执行完成后，`cerbot`会自动更新`Nginx`的配置文件来使用刚刚生成的证书，并启用`HTTPS`。

```sh
server {
    # 使用https时的配置，ssl监听端口为443
    # 启用http/2
    listen 443 ssl http2; 
    # ipv6
    listen [::]:443 ssl http2 ipv6only=on; 
    # ssl要使用的证书信息
    ssl_certificate /etc/letsencrypt/live/apqx.me/fullchain.pem; 
    # 密钥
    ssl_certificate_key /etc/letsencrypt/live/apqx.me/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf; 
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; 

    # 网站index.html的位置
    root /home/apqx/Code/apqx.github.io/_site;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    # 域名
    server_name apqx.me;

    location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying a 404.
            try_files $uri $uri/ =404;
    }
}
```

访问网站，看到已经启用了`HTTPS`，证书由`Let’s Encrypt`签发，有效期90天。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/lets_encrypt.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ssl certificate" }

我使用的是`Google Cloud`在台湾数据中心的服务器，延迟60ms，比`GitHub Pages`的平均300ms好多了，但当然比不上离我最近的阿里云杭州数据中心的10ms，不过对于静态网站已经足够。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20200914/ping_apqxme.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="ping" }