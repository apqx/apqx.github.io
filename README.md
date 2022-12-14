# 立泉の写字板

基于`Jekyll`的开源[个人博客](https://apqx.me)示例，遵循[Material Design](https://material.io)设计规范，使用`Google`的[Material components web](https://github.com/material-components/material-components-web)组件库。

极简风格，文字、色彩、动画之外不添加多余元素，这也是我自己的博客。

由`Jekyll`把`Markdown`格式文章转换为`HTML`网页，生成一个静态站点，可以托管在[GitHub Pages](https://pages.github.com)或更灵活的个人服务器上。

# 本地调试

切换到内部的`npm`工程目录，构建生成所需的`js`、`css`文件：

```sh
# 切换到内置的webpack工程目录
cd npm
# 安装所需module依赖
npm install
# 构建，在 /npm/dist/目录下生成 apqx.js 和 apqx.css
npm run build
```

在`_includes/head-common.html`中定义着网站使用的`apqx.js`和`apqx.css`，它们是由内部的`npm`工程生成的，为提高访问速度而被托管到阿里云的`OSS`上。

本地调试时，需要修改这些资源为本地文件以实时响应`npm`工程的变化：

```html
<!-- css和js文件由内部的npm工程输出 -->
<!-- only for test -->
<link rel="stylesheet" href="/npm/dist/apqx.css" />
<script type="text/javascript" src="/npm/dist/apqx.js"></script>
<link rel="stylesheet" href="/css/materialFontsIcons.css" />

<!-- 这里用Jekyll的Liquid模版语言隐藏掉这段指向阿里云托管的外部资源的代码 -->
{% comment %}
<!-- for publish -->
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.css" />
<script type="text/javascript" src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.js"></script>
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

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动服务：

```sh
# 安装所需依赖
bundle install
# 启动jekyll服务，在http://localhost:4000即可访问生成的博客网站
bundle exec jekyll serve -l -o
```

`Jekyll`会在`_site/`目录下生成一个由静态`HTML`页面构成的网站源码，在本地`4000`端口可以访问。

`http://localhost:4000`

# 部署到GitHub Pages

对于部署到[GitHub Pages](https://pages.github.com)的情况，因为中国大陆的访问速度受限，一般会把`HTML`网页之外的所有资源文件托管到大陆的云服务平台上以提高国内的访问速度，比如阿里云`OSS`就非常合适。

本地调试完成后，如果`npm`工程生成了新的`js`和`css`资源文件，需要更新阿里云`OSS`托管的旧文件，修改`_includes/head-common.html`以使用这些云端托管的资源文件。

```html
<!-- css和js文件由内部的npm工程输出 -->
<!-- 这里用Jekyll的Liquid模版语言隐藏掉这段指向本地资源的代码 -->
{% comment %}
<!-- only for test -->
<link rel="stylesheet" href="/npm/dist/apqx.css" />
<script type="text/javascript" src="/npm/dist/apqx.js"></script>
<link rel="stylesheet" href="/css/materialFontsIcons.css" />
{% endcomment %}

<!-- for publish -->
<link rel="stylesheet" href="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.css" />
<script type="text/javascript" src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/apqx.js"></script>
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
git commit
# push到自己的Github repository上
git push origin
```

等待数秒或数分钟，取决于`GitHub Pages`等待执行的任务量，完成后`GitHub Pages`上的网页就会更新。