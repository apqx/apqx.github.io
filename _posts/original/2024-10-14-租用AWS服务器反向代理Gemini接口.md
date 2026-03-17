---
layout: post
categories: original
title: "租用 AWS 服务器反向代理 Gemini 接口"
author: 立泉
mention: EC2 Nginx ReverseProxy 按量付费 配额限制
date: 2024-10-14 +0800
description: Gemini 的 API 域名无法在大陆直接访问，每次调用它做一些简单事情都要先启动系统代理。最近通过 AWS Free Tier 获得了 EC2 服务器一年的试用期，但除去做这个博客 Server 外并没有找到其它实际需求，对 Google API 做反向代理似乎是一个有价值的切入点。
cover: 
tags: Code AI Gemini AWS EC2 Proxy Nginx
---

Gemini 的 API 域名`generativelanguage.googleapis.com`无法在大陆直接访问，每次调用它做一些简单事情都要先启动系统代理。最近通过 AWS Free Tier 获得了 EC2 服务器一年的试用期，但除去做这个博客 Server 外并没有找到其它实际需求，对 Google API 做反向代理似乎是一个有价值的切入点。

## Free tier

AWS Free tier 对 t2.micro 或 t3.micro 实例每月有 720 小时免费时长，即只启动一个实例的情况下是完全免费的。同时包含搭配 IPv4 地址和向外 100GB 流量，micro 实例的 2 vCPU + 1 GiB 内存对于个人网站和 API 轻度使用十分充足。

> In your first year of opening an AWS account, you get 750 hours per month of t2.micro instance usage (or t3.micro where t2.micro isn't available) when used with free tier AMIs, 750 hours per month of public IPv4 address usage, 30 GiB of EBS storage, 2 million I/Os, 1 GB of snapshots, and 100 GB of bandwidth to the internet. Data transfer charges are not included as part of the free tier allowance. Charges may apply depending on your account's free tier status.

而且 AWS 首尔数据中心与国内连接的网络线路相当好，70ms 延迟相比 Cloudflare 动辄 200ms 有体感上的明显改善：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20241014/aws_cf_ping_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Ping tests of aws seoul and cloudflare cdn" }

系统镜像选择 Ubuntu Server 时默认用户名为 ubuntu，配置好 Key pair 可以直接无密码登录：

```sh
ssh ubuntu@ip
```

在网络选项中指定实例所属 Security Group，由它控制出站、入站连接的防火墙规则，需要检查 SSH 和 HTTP、HTTPS 的 22、80、443 端口是否开启：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20241014/aws_security_group_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="AWS security group" }

## Nginx

如今使用 Nginx 搭建网站配置 HTTPS 已经很简单，之前[写过一篇部署网站的记录]({% link _posts/original/2020-09-14-部署GitHub Pages博客到私有服务器.md %}){: target="_blank" }，完成后配置文件内容如下：

```sh
# mudan.me.conf
server {
    # 网站 index.html 位置
	root /home/apqx/Blog/mudan.me;

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

	# 配置 404 错误页面
   	error_page 404 /404.html;

	server_name mudan.me;

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri.html $uri/ =404;
	}

	# 监听 443 端口的 HTTPS
    listen 443 ssl; # managed by Certbot
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

Reverse Proxy 反向代理是与代理客户端相反的代理服务端，客户端与代理服务器交互，由代理服务器作为中间人去连接服务端。对于 Google API，客户端连接国外未被封锁的代理服务器可绕过访问限制，但这种方式不建议滥用，在深度包检测日渐成熟的情况下可能连累代理服务器一起被关小黑屋。

反向代理配置如下，访问`gemini.mudan.me`的请求会被转发给`https://generativelanguage.googleapis.com`，响应数据经过同样的路径返回客户端：

```sh
# gemini.mudan.me.conf
server {
    # ipv4
    listen 80 default_server;
    # ipv6
    listen [::]:80 default_server;

    server_name gemini.mudan.me;

    location / {
            proxy_pass https://generativelanguage.googleapis.com;
            # 在 header 中添加当前代理 server 的 host 可能会被目标服务检测拒绝，比如 gemini，应该不加
            # proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

一个`server`下可设置多个`location`分别对应不同的被反代网站：

```sh
server {
    server_name api.mudan.me;

    # https://api.mudan.me/gemini/path
    # 对应反代网站
    # https://generativelanguage.googleapis.com/path
    location /gemini {
        # 注意 url 尾部必须带有 / ，否则对应反代网站是 https://generativelanguage.googleapis.com/gemini/path
        proxy_pass https://generativelanguage.googleapis.com/;
    }

    # https://api.mudan.me/openai/path
    # 对应反代网站
    # https://api.openai.com/path
    location /openai {
        proxy_pass https://api.openai.com/;
    }
}
```

## 配额限制

Gemini API 按量计费，如果担心用量过大或被盗用，可以在 [Google Cloud Console](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas){: target="_blank" } 中对 Generative Language API 设置配额限制：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20241014/gemini_api_quota_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Gemini api quota in google cloud console" }