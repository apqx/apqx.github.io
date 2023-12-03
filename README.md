# 立泉の写字板

一个基于[Jekyll](https://jekyllrb.com)的[Material Design](https://material.io)开源博客，使用`Google`提供的[Material Components Web](https://github.com/material-components/material-components-web)组件库。

这是我自己的博客网站，它并非通用`Jekyll`模版，而是包含了太多我个人倾向的分享空间，淡红色极简风，文字、色彩、动画之外不添加多余元素，可以把它当作一个使用`Material Design`的个人站参考。

博客链接 👉 [立泉の写字板](https://mudan.me)

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index.webp)

看剧分享 📸

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index_opera.webp)


博文使用`Markdown`格式撰写，由`Jekyll`将其按指定方式转换为`HTML`网页，生成静态站点，可以托管在[GitHub Pages](https://pages.github.com)或更灵活的云服务器上。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_essay.webp)

# 本地调试

首先切换到内部`webpack`工程目录，构建所需的`js`、`css`文件：

```sh
# 进入内部webpack工程
cd npm
# 安装所需依赖
npm install
# 在/npm/dist/目录下生成js和css
npm run build
```

`_includes/head-common.html`中定义着网站使用的`js`和`css`资源，它们由内部`webpack`工程生成，为提高访问速度而被托管到阿里云`OSS`上。

使用本地/云端资源由`_includes/configure.html`中的`debug`参数控制。本地调试时，需要将其设为`true`，进入`debug`模式使用上面生成的本地资源以实时响应`webpack`工程变化。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为true，将会使用本地资源 -->
{% assign debug = true %}
```

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动本地服务：

```sh
# 安装jekyll，macOS使用Homebrew
brew install jekyll
# 安装config.yml中定义的jekyll插件
bundle install
# 启动jekyll服务
# 同时自动调用浏览器打开http://localhost:4000进入博客
bundle exec jekyll serve -l -o
```

`Jekyll`会在`_site/`目录下生成一个由`HTML`页面构成的静态网站，并`serve`到本地4000端口，通过这个链接访问：

```sh
http://localhost:4000
```

# 部署到GitHub Pages

因为[GitHub Pages](https://pages.github.com)在中国大陆受限，所以一般会把`HTML`页面里的资源托管到大陆的云平台上以提高国内访问速度，比如阿里云的`OSS`对象存储服务。如果域名已备案也可以再叠一层`CDN`加速。

本地调试完成后，如果`webpack`生成了新的`js`和`css`，需要上传到`OSS`托管，然后修改`_includes/configure.html`关闭`debug`模式即可使用这些托管的资源。

```html
<!-- _includes/configure.html -->

<!-- 设置debug为false，将使用云端托管资源 -->
{% assign debug = false %}
```

本地修改`commit`后`push`到自己的`GitHub repository`，`GitHub Pages`会自动执行`Jekyll`的`build`操作，就像本地调试那样把`Markdown`文章转换为`HTML`页面并`serve`到指定域名下。

```sh
# 本地commit
git commit
# push到自己的Github repository
git push origin
```

静候数秒或数分钟，取决于`Pages`等待执行的任务量，完成后`Pages`上的网页就会更新。

![立泉の写字板](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/img/screenshot_index_phone.webp)