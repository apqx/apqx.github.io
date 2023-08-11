# 立泉の写字板

这是一个基于`Jekyll`的开源[博客](https://mudan.me)示例，遵循[Material Design](https://material.io)设计规范，使用`Google`的[Material components web](https://github.com/material-components/material-components-web)组件库。

淡雅极简风，文字、色彩、动画之外不添加多余元素，这也是我自己的博客。

博文使用`Markdown`格式撰写，由`Jekyll`将其按照指定的方式转换为`HTML`网页，生成一个静态站点，可以托管在[GitHub Pages](https://pages.github.com)或更灵活的云服务器上。

# 本地调试

切换到内部的`npm`工程目录，构建生成所需的`js`、`css`文件：

```sh
# 进入内部npm工程
cd npm
# 安装所需依赖
npm install
# 构建，在/npm/dist/目录下生成js和css
npm run build
```

在`_includes/head-common.html`中定义着网站使用的`js`和`css`，它们由内部的`npm`工程生成，为提高访问速度而被托管到阿里云`OSS`上。

本地调试时，需要修改这些资源为本地文件以实时响应`npm`工程的变化：

```html
<!-- _includes/head-common.html -->

<!-- css和js文件由内部的npm工程输出 -->
<!-- only for test -->
<link rel="stylesheet" href="/npm/dist/apqx.v[version].css" />
<script type="text/javascript" src="/npm/dist/apqx.v[version].js"></script>
<link rel="stylesheet" href="/css/materialFontsIcons.css" />

<!-- 这里用Jekyll的Liquid模版语言隐藏掉这段指向阿里云托管的外部资源的代码 -->
{% comment %}
<!-- for publish -->
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.v[version].css" />
<script type="text/javascript" src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.v[version].js"></script>
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/materialFontsIcons.css" />
<!-- Global site tag (gtag.js) - Google Analytics -->
<!-- close it when on test -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GDLCDFZXBF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-GDLCDFZXBF');
</script>
{% endcomment %}
```

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)后，启动本地服务：

```sh
# 安装jekyll，macOS使用home-brew
brew install jekyll
# 安装定义在_config.yml中的jekyll插件
bundle install
# 启动jekyll服务，同时自动调用浏览器打开http://localhost:4000
bundle exec jekyll serve -l -o
```

`Jekyll`会在`_site/`目录下生成一个由静态`HTML`页面构成的网站源码，浏览器访问本地`4000`端口就可以看到这个博客网站了。

`http://localhost:4000`

# 部署到GitHub Pages

对于部署到[GitHub Pages](https://pages.github.com)的情况，因为中国大陆的访问速度受限，一般会把`HTML`网页之外的资源托管到大陆的云平台上以提高国内访问速度，比如阿里云的`OSS`对象存储服务。

本地调试完成后，如果`npm`工程生成了新的`js`和`css`文件，需要更新阿里云`OSS`托管的旧文件，修改`_includes/head-common.html`以使用这些云端托管的资源。

```html
<!-- _includes/head-common.html -->

<!-- css和js文件由内部的npm工程输出 -->
<!-- 这里用Jekyll的Liquid模版语言隐藏掉这段指向本地资源的代码 -->
{% comment %}
<!-- only for test -->
<link rel="stylesheet" href="/npm/dist/apqx.v[version].css" />
<script type="text/javascript" src="/npm/dist/apqx.v[version].js"></script>
<link rel="stylesheet" href="/css/materialFontsIcons.css" />
{% endcomment %}

<!-- for publish -->
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.v[version].css" />
<script type="text/javascript" src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.v[version].js"></script>
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/materialFontsIcons.css" />
<!-- Global site tag (gtag.js) - Google Analytics -->
<!-- close it when on test -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GDLCDFZXBF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-GDLCDFZXBF');
</script>
```

把本地修改`commit`后`push`到自己的`GitHub repository`上，`GitHub Pages`会自动执行`Jekyll`的编译操作，就像本地调试时那样把`Markdown`文章转换为`HTML`页面并更新到指定的域名下。

```sh
# 本地commit
git commit
# push到自己的Github repository上
git push origin
```

等待数秒或数分钟，取决于`Pages`等待执行的任务量，完成后`Pages`上的网页就会更新。