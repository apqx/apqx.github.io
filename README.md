# 立泉落落

[![Deploy Jekyll site to Pages](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml)

由[Jekyll](https://jekyllrb.com)驱动的静态博客，遵循`Google`的[Material Design](https://material.io)设计规范，主体使用[Material Components Web](https://github.com/material-components/material-components-web)框架。

并非通用博客模版，而是以我自己的喜好量身定制，由随笔、转载、诗文、看剧4个板块组成，应用淡色极简风格，在文字、色彩和动画之外不添加多余元素。或可作为`Material Design`个人站参考，但不建议直接套用，尚未进行模版优化。

主页：[立泉の写字板](https://mudan.me)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index.webp)

看剧：[立泉の看剧](https://mudan.me/opera)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_opera.webp)

## Markdown

博文以`Markdown`格式撰写，由`Jekyll`将其转换为`HTML`网页。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/post.webp)

## 本地调试

工程由`Webpack`和`Jekyll`组成，`Webpack`用于生成网站所需的`Javascript`和`CSS`资源，`Jekyll`则用来将`Markdown`文章转换为`HTML`网页，生成可部署的静态站点。

### Webpack

切换到内部`Webpack`工程目录，编译生成`JS`、`CSS`：

```sh
# 进入内部Webpack工程
cd npm
# 安装所需依赖
npm install
# 执行编译，在 npm/dist/ 目录下生成 JS、CSS
npm run build
```

网站部署时这些资源文件被托管在`阿里云OSS`上以提高中国大陆的访问速度，在`_includes/head.html`中可以看到对它们的引用。

调试时需要将`_includes/configure.html`中的`debug`参数设为`true`，`Jekyll`会在`<header></header>`中引用本地资源。进入`debug`模式后`JS`日志也会输出到浏览器`Console`中。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为true，将会使用本地资源 -->
{% assign debug = true %}
```

### Jekyll

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动本地服务：

```sh
# 安装 Jekyll，macOS 使用 Homebrew
brew install jekyll
# 安装 config.yml 中定义的 Jekyll 插件
bundle install
# 启动 Jekyll 服务，自动调用浏览器进入博客
# http://localhost:4000
bundle exec jekyll serve -l -o --trace --draft
```

`Jekyll`会在`_site/`目录下生成静态网站，并`serve`到本地`4000`端口。

```sh
http://localhost:4000
```

`jekyll serve`是以开发模式生成站点，一些插件比如`jekyll-sitemap`并不会使用`_config.yml`中配置的域名。生成可部署站点需执行`jekyll build`。

```sh
bundle exec jekyll build --trace
```

## 部署到GitHub Pages

调试后，`Webpack`生成的新`JS`和`CSS`文件需要更新到`OSS`中，然后在`_includes/configure.html`中关闭`debug`模式即可使用这些远程资源。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为false -->
{% assign debug = false %}
```

工程`push`到自己的`repository`，`GitHub Pages`会自动执行`Jekyll`的`build`操作，生成静态网站。

```sh
git push
```

静候数秒或数分钟，取决于`Pages`执行速度，完成后网页就会更新。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/index_phone.webp)

## 版权

博客代码以`GPL`许可开源，但对文章内容保留著作权，对摄影照片保留版权，未经允许不可用作商业用途。