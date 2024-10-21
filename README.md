# 立泉落落

[![Deploy Jekyll site to Pages](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml)

基于[Jekyll](https://jekyllrb.com)构建的[Material Design](https://material.io)静态博客，使用`Google`提供的[Material Components Web](https://github.com/material-components/material-components-web)框架。

它并非通用博客模版，以我自己的喜好量身定制，由随笔、转载、诗文、看剧4个板块组成，采用淡色极简风格，在文字、色彩和动画之外不添加多余元素。或可作为`Material Design`个人站参考，但不建议直接套用，尚未进行模版优化。

主页：[立泉の写字板](https://mudan.me)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index.webp)

看剧：[立泉の看剧](https://mudan.me/opera)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_opera.webp)

## Markdown

博文以`Markdown`格式撰写，由`Jekyll`将其转换为`HTML`网页，生成静态站点，可以托管在[GitHub Pages](https://pages.github.com)或其它云服务上。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/post.webp)

## 本地调试

工程由`Webpack`和`Jekyll`组成，`Webpack`用于生成网站所需的`Javascript`和`CSS`资源，`Jekyll`则用来将`Markdown`文章转换为`HTML`网页，生成可部署的`Web`站点。

### Webpack

首先切换到内部`Webpack`工程目录，编译生成`JS`、`CSS`：

```sh
# 进入内部Webpack工程
cd npm
# 安装所需的依赖
npm install
# 执行编译，在`npm/dist/`目录下生成JS、CSS
npm run build
```

网站部署时这些资源文件被托管在`阿里云OSS`上以提高中国大陆的访问速度，在`_includes/head.html`中可以看到对它们的引用。

调试时则使用本地资源以响应`Webpack`工程变化，需要将`_includes/configure.html`中的`debug`参数设为`true`，`Jekyll`会检测此参数来更改`<header></header>`中引用的资源，而且进入`debug`模式后`JS`日志也会输出到浏览器`Console`中。

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
bundle exec jekyll serve -l -o --trace --draft
```

`Jekyll`会在`_site/`目录下生成静态网站，并`serve`到本地`4000`端口。

```sh
# 站点会实时响应工程文件变化，自动更新
http://localhost:4000
```

`jekyll serve`是以开发模式生成站点，一些插件比如`jekyll-sitemap`并不会使用`_config.yml`中配置的域名。生成可部署的站点需执行`jekyll build`。

```sh
bundle exec jekyll build --trace
```

## 部署到GitHub Pages

调试后，如果`Webpack`生成了新`JS`和`CSS`文件，需要更新`OSS`中托管的版本，然后在`_includes/configure.html`中关闭`debug`模式即可使用这些远程资源。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为false -->
{% assign debug = false %}
```

工程`push`到自己的`repository`，`GitHub Pages`会自动执行`Jekyll`的`build`操作，生成静态网站并`serve`到指定域名下。

```sh
git push
```

静候数秒或数分钟，取决于`Pages`执行速度，完成后网页就会更新。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_phone.webp)

## 版权

博客代码以`GPL`许可开源，但对其中的文章内容保留著作权，对摄影照片保留版权，未经允许不可用作商业用途。