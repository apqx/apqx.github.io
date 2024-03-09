# 立泉の写字板

[![Deploy Jekyll site to Pages](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml)

基于[Jekyll](https://jekyllrb.com)并遵循[Material Design](https://material.io)的开源博客，使用`Google`提供的[Material Components Web](https://github.com/material-components/material-components-web)组件库。

它并非一般通用的博客模版，而是完全以我自己的喜好量身定制的分享空间。由随笔、转载、诗文、看剧4个模块组成，整体采用淡红色极简风格，在文字、色彩和动画之外不添加任何多余元素。或可作为使用`Material Design`的个人站参考，但不建议直接套用，因为目前尚未进行普适的模版优化，灵活性不足。

博客链接 👉 [立泉の写字板](https://mudan.me)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index.webp)

看剧分享 📸

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index_opera.webp)

# Markdown

博文使用`Markdown`格式撰写，由`Jekyll`将其转换为`HTML`网页，生成静态站点，可以托管在[GitHub Pages](https://pages.github.com)或更灵活的云服务器上。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_essay.webp)

# 本地调试

博客由`Jekyll`和`Webpack`组成，`Jekyll`用来将`Markdown`文章转换为`HTML`网页，`Webpack`用于生成网站所需的`Javascript`和`CSS`资源。

首先切换到内部`Webpack`工程目录，编译生成`Js`、`CSS`：

```sh
# 进入内部Webpack工程
cd npm
# 安装所需依赖
npm install
# 在/npm/dist/目录下生成Js、CSS
npm run build-release
```

博客网站部署时这些资源文件会被托管到`阿里云OSS`上以提高中国大陆的访问速度，在`_includes/head-common.html`中可以看到对它们的引用。

调试时则使用本地资源以实时响应`Webpack`工程的变化，需要将`_includes/configure.html`中的`debug`参数设为`true`，进入`debug`模式后`Js`日志也会输出到浏览器的`Console`中。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为true，将会使用本地资源 -->
{% assign debug = true %}
```

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动本地服务：

```sh
# 安装Jekyll，macOS使用Homebrew
brew install jekyll
# 安装config.yml中定义的Jekyll插件
bundle install
# 启动Jekyll服务，自动调用浏览器进入博客
# http://localhost:4000
bundle exec jekyll serve -l -o
```

`Jekyll`会在`_site/`目录下生成静态网站，并`serve`到本地4000端口。

```sh
http://localhost:4000
```

# 部署到GitHub Pages

本地调试完成后，如果`Webpack`生成了新的`Js`和`CSS`文件，需要上传到`OSS`托管，然后修改`_includes/configure.html`关闭`debug`模式即可使用这些托管的资源。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为false，将使用云端托管资源 -->
{% assign debug = false %}
```

本地修改后`push`到自己的`repository`，`GitHub Pages`会自动执行`Jekyll`的`build`操作，生成静态网站并`serve`到指定域名下。

```sh
git commit
# push到自己的repository
git push origin
```

静候数秒或数分钟，取决于`Pages`的执行速度，完成后网页就会更新。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index_phone.webp)

# 致谢

感谢[Jetbrains](www.jetbrains.com)提供的[Open Source Development License](https://www.jetbrains.com/community/opensource/#support)

![JetBrains Logo (Main) logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg)

Copyright © 2000-2024 JetBrains s.r.o. JetBrains and the JetBrains logo are registered trademarks of JetBrains s.r.o.