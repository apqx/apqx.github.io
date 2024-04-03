# 立泉の写字板

[![Deploy Jekyll site to Pages](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml)

基于[Jekyll](https://jekyllrb.com)的[Material Design](https://material.io)静态博客示例，由`Google`提供的[Material Components Web](https://github.com/material-components/material-components-web)构建。

它并非通用博客模版，而是以我自己喜好量身定制的分享空间，由随笔、转载、诗文、看剧4个板块组成，采用淡红色极简风格，在文字、色彩和动画之外不添加多余元素。或可作为`Material Design`个人站参考，但不建议直接套用，尚未进行普适的模版优化。

博客主页 👉 [立泉の写字板](https://mudan.me)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index.webp)

看剧分享 👉 [立泉の看剧](https://mudan.me/opera)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_opera.webp)

## Markdown

博文使用`Markdown`格式撰写，由`Jekyll`将其转换为`HTML`网页，生成静态站点，可以托管在[GitHub Pages](https://pages.github.com)或其它云服务器上。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/essay.webp)

## 本地调试

博客由`Webpack`和`Jekyll`组成，`Webpack`用于生成网站所需的`Javascript`和`CSS`资源，`Jekyll`则用来将`Markdown`文章转换为`HTML`网页，生成可部署的`Web`站点。

### Webpack

首先切换到内部`Webpack`工程目录，编译生成`Js`、`CSS`：

```sh
# 进入内部Webpack工程
cd npm
# 安装所需的依赖
npm install
# 执行编译，在`npm/dist/`目录下生成Js、CSS
npm run build-release
```

网站部署时这些资源文件会被托管到`阿里云OSS`上以提高中国大陆的访问速度，在`_includes/head-common.html`中可以看到对它们的引用。

调试时则使用本地资源以实时响应`Webpack`工程变化，需要将`_includes/configure.html`中的`debug`参数设为`true`，`Jekyll`会检测此参数来更改`<header></header>`中引用的资源，而且进入`debug`模式后`Js`日志也会输出到浏览器的`Console`中。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为true，将会使用本地资源 -->
{% assign debug = true %}
```

### Jekyll

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动本地服务：

```sh
# 安装Jekyll，macOS使用Homebrew
brew install jekyll
# 安装`config.yml`中定义的Jekyll插件
bundle install
# 启动Jekyll服务，自动调用浏览器进入博客
# http://localhost:4000
bundle exec jekyll serve -l -o --trace
```

`Jekyll`会在`_site/`目录下生成静态网站，并`serve`到本地4000端口。

```sh
http://localhost:4000
```

`jekyll serve`是以开发模式生成站点，一些插件比如`jekyll-sitemap`并不会使用`_config.yml`中配置的域名，如果要生成可以部署的站点，需执行`jekyll build`。

```sh
bundle exec jekyll build --trace
```

## 部署到GitHub Pages

调试后，如果`Webpack`生成了新的`Js`和`CSS`文件，需要上传到`OSS`托管，然后修改`_includes/configure.html`关闭`debug`模式即可使用这些托管的远程资源。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为false，将使用云端托管资源 -->
{% assign debug = false %}
```

工程`push`到自己的`repository`，`GitHub Pages`会自动执行`Jekyll`的`build`操作，生成静态网站并`serve`到指定域名下。

```sh
# push到自己的repository
git push
```

静候数秒或数分钟，取决于`Pages`的执行速度，完成后网页就会更新。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_phone.webp)

## 版权

此博客工程代码以`GPL`许可开源，但对其中的文章内容保留著作权，尤其`看剧`板块外链的摄影照片，包含剧团、演员和摄影师的版权，未经允许不可用于商业用途。

## 致谢

感谢[Jetbrains](https://www.jetbrains.com)提供的[Open Source Development License](https://www.jetbrains.com/community/opensource/#support)，`Intellij IDEA`和`CLion`是我非常喜欢的开发工具。

![JetBrains Logo (Main) logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg)