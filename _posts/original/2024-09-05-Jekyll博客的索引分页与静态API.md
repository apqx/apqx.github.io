---
layout: post
categories: original
title: "Jekyll博客的索引分页与静态API"
author: 立泉
mention: Pagination Scroll
date: 2024-09-05 +0800
description: 
cover: 
tags: Code Blog Jekyll 分页 Scroll
---

`Jekyll`是一个从格式化文本生成静态站点的工具，所谓“静态”是指所有`HTML`页面都是在编译时创建，部署后不能动态生成新页面。由`HTML`组成的静态网站可以不需要传统后端服务，直接托管到免费的`Github Pages`、`Cloudflare Pages`上，非常适合博客之类的轻量用途。

但“静态”并不意味着网站不能交互，可以在页面里加载`JS`代码来监测交互事件动态改变显示内容，所以静态博客也能有非常大的灵活性。

## 索引分页

博客首页一般是文章索引，当文章数量很多时为优化加载速度和页面性能不应该一次加载整个列表，而是先加载一段，再按需逐段加载剩余内容，即`Pagination`“分页”。

常见的分页有2种，一种是“静态”，`Jekyll`编译时生成多个页面，每个页面只显示一部分，并在页面底部设置索引导航。这种方式非常简单，应用也最广泛，但我更倾向首页的文章列表是一条完整时间线，不应该拆分到多个页面，会破坏连续性。所以选择第二种“动态”，即监测用户滚动，用`JS`分段加载文章列表填充到页面显示出来，就像普通App那样。

如此一来需要让`Jekyll`在编译时生成分段的文章列表，每段都保存在单独的`Json`文件中，这些文件可以被`JS`下载解析，即是所谓的“静态API”。

## 静态API

`Jekyll`提供[jekyll-paginate-v2](https://github.com/sverrirs/jekyll-paginate-v2){: target="_blank" }插件来实现高级分页，它的`Auto Pages`模式可以自动给每一个`Category`、`Collection`、`Tag`都生成分页文件，整个站点的文章都被以不同方式分类、分页为可用的`API`。

```yaml
# Jekyll配置文件`_config.yml`
plugins:
  # 启用分页插件
  - jekyll-paginate-v2

# 配置分页参数
pagination:
  enabled: true
  # 要扫描的文章目录`_posts`
  collection: "posts"
  # 每页的文章数
  per_page: 10
  # 生成分页文件的路径，后面可以为Category、Tag、Collection单独配置
  permalink: ""
  # 分页文件后缀
  extension: json
  # 分页文件名，比如`page-2.json`
  indexpage: "page-:num"
  # 是否按时间倒序
  sort_reverse: true

# 配置自动分页
autopages:
  enabled: true
  # 禁用Category自动分页
  categories:
    enabled: false
  # 禁用Collection自动分页
  collections:
    enabled: false
  # 启用Tag自动分页
  tags:
    enabled: true
    # 每页的布局文件，定义生成什么样的Json
    # 指定为`_layouts/paginate-tag.html`
    layouts:
      - paginate-tag.html
    # 指定输出的Json文件路径
    permalink: "/api/paginate/tags/:tag"
    slugify:
      mode: "default"
      case: false
```

因为我博客里所有文章都是按`Tag`分类，所以只需配置`Tag`分页，不同的索引页再去加载对应`Tag`的`Json`。

在`_layouts/paginate-tag.html`里定义生成的`Json`格式，`Jekyll`会自动把每一页的文章列表填充到`Liquid`模版语言的`paginator`变量里，遍历`paginator.posts`生成的就是当页文章列表。

```json
// _layouts/paginate-tag.html
// 用Liquid模版语言定义Json格式
{%- raw %}
{
    "data": {
        "totalPosts": {{ paginator.total_posts }},
        "totalPages": {{ paginator.total_pages }},
        "postsPerPage": {{ paginator.per_page }},
        "currentPageIndex": {{ paginator.page }},
        "previousPagePath": "{{ paginator.previous_page_path }}",
        "nextPagePath": "{{ paginator.next_page_path }}"
    },
    "posts": [
        {%- for post in paginator.posts %}
        {
            "title": "{{ post.title }}",
            "date": "{{ post.date | date: "%Y年%m月%d日" }}",
            "path": "{{ post.url }}",
            "author": "{{ post.author }}",
            "description": "{{ post.description}}",
            "cover": "{{ post.cover }}"
        }{% unless forloop.last %},{% endunless %}
        {%- endfor %}
    ]
}{% endraw %}
```

注意`_config.yml`中的分页目录`permalink: "/api/paginate/tags/:tag"`和分页文件名`indexpage: "page-:num"`，配置后执行`jekyll build`命令，会扫描`_posts`目录中的所有文章，在`_site`目录下生成按`Tag`分类的分页文件。

```sh
|-_site/api/paginate/tags/
    |-tag1/
        |-page-1.json
        |-page-2.json
    |-tag2/
        |-page-1.json
        |-page-2.json
        |-page-3.json
```

`JS`下载这些分页的`Json`文件，即可按需分段加载文章列表。

## 加载时机

滚动加载新数据是一个常见交互，如何检测滚动并判断加载时机也是一个常见话题，所以值得一并介绍。

首先要知道列表“滚动”的定义，它是指列表的`Height`高度超过其`Viewport`显示区域，所以处于可滚动的状态。此时只需检测列表的`ScrollY`滚动距离，就可以通过`Height - Viewport.height - ScrollY`计算列表的最后一个元素距离`Viewport`显示出来的距离，当它小于一个阈值就是触发加载新数据的时机。

另外，也要注意过滤掉滚动时高频触发的加载事件。