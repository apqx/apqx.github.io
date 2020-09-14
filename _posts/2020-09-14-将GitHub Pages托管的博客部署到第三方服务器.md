---
layout: post
type: essy
title:  "将GitHub Pages托管的博客部署到第三方服务器"
author: 立泉
date:   2020-09-14 +0800
categories: essy
---

这个博客是托管在`GitHub Pages`上的，[apqx.github.io](https://apqx.github.io)， 绝对不是我的错觉，它在大陆的访问速度正变得越来越慢了，在一些情况下，甚至需要等待5秒以上才能打开，这是我无法接受的。正如博客的名字，`“立泉の写字板”`，这里是我沉淀知识和阅历的地方，应该在互联网上触手可及，而非莫名其妙的等待。

# 镜像

前几年，`GitHub Pages`并不是这个样子，至少当时我很满意才会把博客托管到这里，可是渐渐的，发生了一些变化，我也开始做一些尝试，尽可能提高一个`非备案域名`在大陆的访问速度。不错，一个普普通通的博客，我不想备案，虽然微不足道，但或许这也是我个人面对`过度内容审查`最后的倔强了。不备案，也就意味着无法使用大陆的`CDN`和`VPS`，而这两项恰恰是网站加速的最优途径，所以，我觉得成年人的标志之一便是，根据自己的好恶，作出选择，并坦然面对相应的后果。

为了减少`GitHub`的仓库容量，毕竟速度那么慢，我把博客里的图片、视频资源都放在了阿里云的`对象存储OSS`上，至少这个只需要实名，不用备案。关于费用，我看到很多人会选择一些小服务商的`OSS`，只是因为它们提供了一定的免费额度，实际上，虽然阿里云的报价表看起来很贵的样子，但对于我这样的个人博客，本来访问量就少，流量并不会太大，所以大可不必担心费用问题。看了下账单，每个月2毛钱左右，充个5元，可以用上好几年吧。。

解决了资源的访问，那么整个博客的速度瓶颈就只剩下对`GitHub`服务器本身的连接速度了，而`GitHub`在大陆没有数据中心，所以这个不使用`CDN`没办法优化，而我又不能使用`CDN`，所以几乎唯一可行的方法是，在一台靠近大陆的服务器上创建这个博客的镜像，然后把我的域名[apqx.me](https://apqx.me)解析到这台服务器上。虽然要多付出一台`VPS`的费用，也看起来多此一举，但它确实解决了博客访问速度慢的问题，而且，可能这台服务器之后会不仅仅用来托管博客镜像，随着我的一些想法越来越多，也会发挥更大的作用。

# 实施

`GitHub Pages`的博客方案其实很简单，整个博客本身是一个`GitHub`仓库，按`Jekyll`工程的目录格式配置文件。

<img class="materialboxed responsive-img" src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/pic/jekyllProject.png" alt="pic">

其中，`_drafts`和`_posts`分别存放用`MarkDown`格式写的草稿和博文，`assets`存放一些媒体资源文件，我已经把它们迁到了阿里云的`OSS`上，所以这里是空的。而`_includs`, `_layouts`, `css`, `font`, `js`则是和网站的主题、布局、模版相关的东西，毕竟`Jekyll`需要使用这些配置才能将`MarkDown`转换为静态`HTML`网页。

完成更改后，只需要执行`git push origin`把内容推到`GitHub`上，`GitHub Pages`就会自动执行`Jekyll`来生成静态网页，然后托管，这样就可以访问到博客了。创建这个博客的镜像，要做的，就是在一台`VPS`上用`git pull`拉取仓库内容，手动执行`jekyll serve`在`_site`目录下生成静态网页，然后配置`Nginx`托管网页即可。

我并不擅长`Java后端`和`Web编程`，但好在需要做的事并不复杂，在`VPS`上安装`Nginx`后，会生成默认的配置文件`/etc/nginx/sites-available/default`，按下面的方式配置：

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

然后重启`nginx`

```sh
sudo systemctl restart nginx
```

就可以用`HTTP`访问到博客的网页了。

# HTTPS

在当前，借助`Let’s Encrypt`启用`HTTPS`已经非常的简单，[cerbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx)是一个基于`Let’s Encrypt`自动为域名生成`SSL`证书并配置`Nginx`的工具，因为`Let’s Encrypt`证书有效期只有90天，`cerbot`也可以自动续期。

```sh
# 安装cerbot
sudo snap install --classic certbot
# 按提示选择要加密的域名，会自动生成证书签名，自动配置nginx的配置文件，启用ssl加密
# 证书目录为/etc/letsencrypt/live/[域名]/
# cerbot会自动执行证书更新
sudo certbot --nginx
```

按提示执行完成后，`cerbot`会自动更新`Nginx`的配置文件`/etc/nginx/sites-available/default`，来使用刚刚生成的证书，并启用`HTTPS`。

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

访问网站，即可看到已经启用了`HTTPS`，证书由`Let’s Encrypt`签发，有效期90天。

<img class="materialboxed responsive-img" src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/pic/letsEncrypt.png" alt="pic">

我使用的是`谷歌云`在台湾数据中心的服务器，延迟在60ms左右，比`GitHub Pages`的平均300ms好多了，但当然比不上离我最近的阿里云杭州数据中心的10ms，不过，对于静态网站来说，已经很好了。

所谓镜像，理想的情况是，在本地执行了`push`之后，`GitHub`自动通知`VPS`博客内容已经发生了更改，执行`pull`拉取源文件，转换为`HTML`后，博客自动更新。emmm，看起来也不复杂，可能之后会做吧，我更新博客的频率并不高，手动执行还可以增加对`Linux`的熟悉度，，自动化的动力毕竟不足，哈哈。