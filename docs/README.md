# Jekyll文件头

在`Jekyll`工程中，待转换的文件要添加如下格式的文件头，告诉`Jekyll`如何转换当前文件。

```markdown
---
layout: post
categories: original
title: "槐安国内春生酒"
author: 立泉
mention: 昆曲 牡丹亭
date: 2019-05-18 +0800
description: 从昆曲《南柯梦》的「入梦」一折看到的这句词，浮想联翩，意犹不尽。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190518/kunqv_nankemeng_diexi.jpg
tags: 碎碎念 戏剧 省昆
hideFromIndex: true
blockFromSearchEngine: true
sitemap: true
redirect_from:
    - /essy/2019/05/18/槐安国内春生酒
---
```

## layout

与`_layout`目录下的同名`html`文件对应，指定该`layout`为当前文件向`html`的转换模版。

关键的`layout`有2个

| layout | _layout/   | 说明     |
|--------|------------|--------|
| post   | post.html  | 文章布局模版 |
| index  | index.html | 索引布局模版 |

### _layout/post.html

文章布局，发布的文章页面，标记此`layout`的`Markdown`文章会以此为模版被转换为`html`网页。

### _layout/index.html

索引布局，每一个文章`type`都有独立的索引页面，命名为`/index-[type].html`，标记此`layout`将会以其为模版转换为`html`网页。

## categories

页面类型，一个页面可以标记多种类型，用于后期的过滤

同时它也被加到了`jekyll`生成的文章页面`URL`中，用于管理不同类型的文章

| type        | 说明                            |
|-------------|-------------------------------|
| original    | 随笔，原创文章，标记此类文章页    |
| repost      | 转载，标记此类文章页和其索引页   |
| poetry      | 诗文，标记此类文章页和其索引页   |
| opera       | 看剧，标记此类文章页和其索引页   |
| common-page | 标记通用页面，比如临时的分享页等 |
| index       | 索引，标记所有的索引页           |
| main        | 标记网站入口 index.html         |

## title

既是文章标题，也是该`html.head`里的网页标题，也与网页通用分享的`og.title`字段对应。

## author

文章作者。

## mention

文章提及的其他关键词，应简练，显示在`tag`相关的文章列表里。

## date

文章日期。

## moreDate

自定义表示日期的字符串，部分文章没有确切的日期，但`jekyll`的`date`必须按格式精准定义，所以为了显示不精准的大致时间范围，如果此字段不为空，就在文章页和索引页显示这个日期。

## description

页面、文章简介，也与网页通用分享的`og.description`字段对应。

## cover

页面、文章的封面图，也与网页通用分享的`og.image`字段对应。

## index-cover

一般网页封面图都是宽图，方便向外部分享展示。在网站内的索引页可以展示更灵活尺寸的封面图，`index-cover`定义仅在这种情况下使用的封面。

## tags

文章标签列表，这些标签会显示在文章页面顶部，点击会列出包含该标签的所有文章。

### 随笔文章tag

两大类：

* 碎碎念（旅行，摄影，戏剧，昆曲，省昆，浙昆，苏昆）
    * 如果有看剧，[剧种]，[剧团]，[剧名]，[折子（全场戏除外）]，[演员]，[剧院]
* CS（二进制，Android，Gradle，Java，Jvm，Flutter，Git，GitHub，Jekyll，JavaScript，Google，GCE，VPS，ShadowSocks，HTTPS, SSH，RaspberryPi，Ubuntu，抓包，下载）

以上分类中的子项并不全，可以按需求新增。

### 转载文章tag

戏剧，昆曲，京剧，历史，[作者]，[人物]，思维，看客（贬义）

### 诗文文章tag

[作者] [时代]

### 看剧文章tag

[剧种]，[剧团]，[剧名]，[折子（全场戏除外）]，[演员]，[剧院]

## hideFromIndex

部分文章可能不想显示在博客的文章列表中，设置此字段为`true`，默认为`false`。

## blockFromSearchEngine

部分页面可能不想被`搜索引擎`索引，设置此字段为`true`，默认为`false`。

## sitemap

部分页面可能不想被加入到网站的sitemap中，设置此字段为`false`，默认为`true`。

## redirect_from

为当前文章页面生成一个指定的URL，使这个URL在`<header>`中重定向到当前文章。

```html
<!DOCTYPE html>
<html lang="en-US">
  <meta charset="utf-8">
  <title>Redirecting&hellip;</title>
  <link rel="canonical" href="https://mudan.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">
  <script>location="https://mudan.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html"</script>
  <meta http-equiv="refresh" content="0; url=https://mudan.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">
  <!-- 自动添加noindex tag，使搜索引擎不抓取此页面 -->
  <meta name="robots" content="noindex">
  <h1>Redirecting&hellip;</h1>
  <a href="https://mudan.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">Click here if you are not redirected.</a>
</html>
```