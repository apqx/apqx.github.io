---
layout: post
type: essy
title:  "macOS Catalina升级踩坑"
author: 立泉
date:   2019-11-26 +0800
categories: essy
---

好久没有遇到过让我这么郁闷的事了，2个月前，Apple开始大规模向mac产品线推送macOS Catalina系统升级，和大部分吃瓜群众一样，我的注意力也完全被新的全局暗黑模式所吸引，恰好也正是在那个时间点，我把PC从Windows迁移到了基于Ubuntu的Zorin OS，开始尝试将Linux作为主力机使用，日常的开发、练习全都集中到了性能更强的PC上。相对的，我的那台2018款MacBook Pro 13，只做一些Linux不擅长的影音相关的娱乐操作，所以，可以说是在一头雾水的情况下，我一度觉得，这次升级，让我掉进了一个大坑里。

我有写博客的习惯，托管在GitHub Pages上，使用Jekyll把MarkDown格式的文章转换成HTML网页，只需要执行

```sh
jekyll serve
```

Jekyll就会在本地4000端口上生成网站服务，用浏览器访问，就可以实时的预览文章转换成HTML之后的显示情况，通常，这个工作是在PC上完成的，尤其是从Windows迁移到对命令行更友好的Linux之后。可是昨天，在我异常的文思泉涌，十分开心、十分Innocent的想用手头的MacBook把心中所想写出来的时候，它出现了：

```
apqx@MBP ~ % jekyll
zsh: /usr/local/bin/jekyll: bad interpreter: /System/Library/Frameworks/Ruby.framework/Versions/2.3/usr/bin/ruby: no such file or directory
```

按照官方 重新安装 jeyyll， bash环境变量， source执行后有效，重启Terminal后失效