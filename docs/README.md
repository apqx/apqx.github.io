# Jekyll文件头

```markdown
---
layout: post
type: original
categories: original
title: "槐安国内春生酒"
author: 立泉
mention: 昆曲 牡丹亭
date: 2019-05-18 +0800
description: 从昆曲《南柯梦》的「入梦」一折看到的这句词，浮想联翩，意犹不尽。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/20190518/kunqv_nankemeng_diexi.jpg
tags: 碎碎念 戏剧 省昆
show: false
redirect_from:
    - /essy/2019/05/18/槐安国内春生酒
---
```

## type

文章类型，目前有4种

| type     | 说明 |
|----------|----|
| original | 随笔 |
| repost   | 转载 |
| poetry   | 诗文 |
| opera    | 看剧 |

### oroginal

随笔，原创文章。

### repost

转载文章，尽可能注明出处、作者、时间。

### poetry

诗文、歌赋、戏词。

### opera

看剧记录，剧照分享。

## layout

与`_layout`目录下的同名`html`文件对应，指定该`layout`，即当前`Markdown`文件就会使用此`layout`转换为`HTML`网页。

关键的`layout`有2个

| layout | _layout/   | 说明     |
|--------|------------|--------|
| post   | post.html  | 文章布局 |
| index  | index.html | 索引布局 |

### _layout/post.html

文章布局，发布的文章页面。

### _layout/index.html

索引布局，每一个文章`type`都有独立的索引页面，命名为`/index-[type].html`。

## categories

与`type`一致，我把它加到了`jekyll`生成的`URL`中，用于区分不同`type`的文章。

## title

既是文章标题，也是该`html.head`里的网页标题，也与网页通用分享的`og`数据的`title`字段对应。

## author

文章作者。

## mention

文章提及的其他关键词，应简练，显示在tag相关的文章列表里。

## date

文章日期。

## moredate

部分文章没有确切的日期，但`jekyll`的`date`必须按格式精准定义，为了显示不精准的大致时间范围，如果此字段不为空，则在文章页和索引页会显示这个日期。

## description

页面、文章简介，也与网页通用分享的`og`数据的`description`字段对应。

## cover

页面、文章的展示图，也与网页通用分享的`og`数据的`image`字段对应。

## tags

文章标签列表，此标签会显示在文章页面顶部，点击会列出包含该标签的所有文章。

随笔、转载、诗文、看剧的tag分离。

### 随笔文章tag

两大类：

* 碎碎念（旅行，摄影，戏剧，昆曲，省昆，浙昆，苏昆）
    * 如果有看剧，[剧种]，[剧团]，[剧名]，[折子（全场戏除外）]，[演员]，[剧院]
* CS（二进制，Android，Gradle，Java，Jvm，Flutter，Git，GitHub，Jekyll，JavaScript，Google，GCE，VPS，ShadowSocks，HTTPS, SSH，RaspberryPi，Ubuntu，抓包，下载）

### 转载文章tag

戏剧，昆曲，京剧，历史，[作者]，[人物]，思维，看客（贬义）

### 诗文文章tag

[作者] [时代]

### 看剧文章tag

[剧种]，[剧团]，[剧名]，[折子（全场戏除外）]，[演员]，[剧院]

## show

部分文章可能不想显示在索引中，设置此字段为`false`。

## redirect_from

为当前文章页面生成一个指定的URL，使这个URL在<header>中重定向到当前文章

```html
<!DOCTYPE html>
<html lang="en-US">
  <meta charset="utf-8">
  <title>Redirecting&hellip;</title>
  <link rel="canonical" href="https://apqx.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">
  <script>location="https://apqx.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html"</script>
  <meta http-equiv="refresh" content="0; url=https://apqx.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">
  <!-- 自动添加noindex tag，使搜索引擎不抓取此页面 -->
  <meta name="robots" content="noindex">
  <h1>Redirecting&hellip;</h1>
  <a href="https://apqx.me/post/original/2021/06/10/%E6%97%85%E8%A1%8C%E5%BF%9703-%E5%85%B0%E8%8B%91%E7%8B%AE%E5%90%BC.html">Click here if you are not redirected.</a>
</html>
```