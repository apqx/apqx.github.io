---
layout: post
categories: original
title: "Jekyll 博客的索引分页与静态 API"
author: 立泉
mention: AutoPages Pagination Scroll
date: 2024-09-05 +0800
description: 博客首页一般显示文章索引，当文章数量很多时为优化性能不应该一次加载整个列表，而是先加载一段再按需逐渐加载剩余内容，即 Pagination 分页。
cover: 
tags: Code Blog Jekyll Pagination Scroll
---

Jekyll 是一个从格式化文本生成静态站点的工具，所谓“静态”是指所有 HTML 页面都在编译时创建，部署后不能动态生成新页面。由 HTML 组成的静态网站可以不需要传统后端服务直接托管到免费的 Github Pages、Cloudflare Pages 或 OSS 对象存储上，非常适合博客这样的轻量用途。

但“静态”并不意味着网站不能交互，可以在页面里加载 JS 代码监测交互事件动态改变显示内容，所以静态博客同样有非常大的灵活性。

## 索引分页

博客首页一般显示文章索引，当文章数量很多时为优化性能不应该一次加载整个列表，而是先加载一段再按需逐渐加载剩余内容，即 Pagination 分页。

分页有 2 种，一种是“静态”，Jekyll 编译时生成多个页面，每个页面只显示一部分，并在底部设置索引导航。这种方式简单所以应用广泛，但我倾向文章列表是一条完整时间线，拆分到多个页面会破坏连续性。所以选择第二种“动态”，即用 JS 监测用户滚动分段加载文章列表填充界面，就像普通 App 那样。

如此，需要让 Jekyll 在编译时生成分段的文章列表，每段保存为单独的 JSON 文件，可以被 JS 下载解析，即是所谓的“静态 API”。

## Auto Pages

Jekyll 提供 [jekyll-paginate-v2](https://github.com/sverrirs/jekyll-paginate-v2){: target="_blank" } 插件实现高级分页，它的 [Auto Pages](https://github.com/sverrirs/jekyll-paginate-v2/blob/master/README-AUTOPAGES.md){: target="_blank" } 模式可以自动给每一个 Category、Collection、Tag 分页，使整个站点的文章以不同方式分类生成可用 API。

```yaml
# Jekyll配置文件 _config.yml
plugins:
  # 启用分页插件
  - jekyll-paginate-v2

# 配置分页参数
pagination:
  enabled: true
  # 要扫描的文章目录 _posts 
  collection: "posts"
  # 每页的文章数
  per_page: 10
  # 生成分页文件的路径，后面可以为 Category、Tag、Collection 单独配置
  permalink: ""
  # 分页文件后缀
  extension: json
  # 分页文件名，:num 表示当前页码，从1开始，比如 page-2.json 
  indexpage: "page-:num"
  # 是否按时间倒序
  sort_reverse: true

# 配置自动分页
autopages:
  enabled: true
  # 禁用 Collection 自动分页
  collections:
    enabled: false
  # 启用 Category 自动分页
  categories:
    enabled: true
    # 每页的布局文件，定义生成什么样的分页格式
    # 指定为 _layouts/paginate-posts-json.html，将会输出为 JSON 格式
    layouts:
      - paginate-posts-json.html
    # 指定输出的 JSON 文件路径，:cat 表示当前 Category 字符
    # 比如名为 repost 的 Category，分页文件将被输出到 /api/paginate/categories/repost 目录下
    permalink: "/api/paginate/categories/:cat"
    slugify:
      mode: "default"
      case: false
  # 启用Tag自动分页
  tags:
    enabled: true
    # 使用同样的布局文件，以同样的分页格式输出
    layouts:
      - paginate-posts-json.html
    # :cat 表示当前 Tag 字符
    permalink: "/api/paginate/tags/:tag"
    slugify:
      mode: "default"
      case: false
```

本博客文章以 Category 分类，配置分页后在不同索引页加载对应 JSON 即可。至于 Tag ，是[文章标记的一些标签]({% link _posts/original/2021-09-01-基于Jekyll实现博客文章「标签化」.md %}){: target="_blank" }，以 Chip 形式显示在文章顶部，点击会弹出相关文章列表，所以也为它启用分页。

在`_layouts/paginate-posts-json.html`里定义输出分页的单页格式，这里配置为 JSON，Jekyll 会自动把每一页的文章列表填充到 Liquid 模版语言的`paginator`变量里，遍历`paginator.posts`生成的即是当页文章列表：

```json
// _layouts/paginate-tag.html
// 用 Liquid 模版语言定义 JSON 格式
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

注意`_config.yml`中的分页目录`permalink: "/api/paginate/categories/:cat"`和分页文件名`indexpage: "page-:num"`，配置后执行`jekyll build`命令会扫描`_posts`目录下的文章，在`_site`目录生成按 Category 分类的分页文件。

```sh
|-_site/api/paginate/categories/
    |-cat1/
        |-page-1.json
        |-page-2.json
    |-cat2/
        |-page-1.json
        |-page-2.json
        |-page-3.json
```

JS 下载分页 JSON 文件即可按需分段加载文章列表。

## Generator

Auto Pages 自动模式之外，jekyll-paginate-v2 支持配置 [Generator](https://github.com/sverrirs/jekyll-paginate-v2/blob/master/README-GENERATOR.md#paginate-categories-tags-locales){: target="_blank" } 实现更丰富的分页条件。比如对同时包含 2 个 Tag 的文章列表分页，使用 Auto Pages 是做不到的，需要像定义普通 Jekyll 页面那样定义 Generator。

上面为 Tag 配置的分页目录是`/api/paginate/tags/:tag`，保持结构统一，这里把同时包含`tag1`和`tag2`的分页也输出到该目录：

```sh
# 创建 api/paginate/tags/tag1&tag2.txt
# 在 Front Matter 中定义 pagination
---
# 指定同样的输出格式
layout: paginate-posts-json
sitemap: false
permalink: /api/paginate/tags/tag1&tag2
pagination:
    permalink: ""
    enabled: true
    # 同时包含 tag1 和 tag2
    tag: "tag1,tag2"
    extension: .json
    indexpage: 'page-:num'
---
```

`bundle exec jekyll build`后可以看到输出文件：

```sh
|-_site/api/paginate/tags/
    |-tag1/
        |-page-1.json
        |-page-2.json
    |-tag2/
        |-page-1.json
        |-page-2.json
        |-page-3.json
    |-tag1&tag2/
        |-page-1.json
        |-page-2.json
```

## 加载时机

滚动加载新数据是一个常见交互，如何检测滚动并判断加载时机也是一个常见话题。首先要知道列表“滚动”的定义，它是指列表的`height`高度超过其`Viewport`显示区域，所以处于可滚动状态。此时只需检测列表的`scrollY`滚动距离，通过`height - Viewport.height - scrollY`计算列表的最后一个元素与`Viewport`显示区域的距离，当它小于一个阈值就是触发加载新数据的时机。

另外应注意过滤滚动时高频触发的加载事件。