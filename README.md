# 立泉の写字板

[https://apqx.me](https://apqx.me)

基于`Jekyll`将`Markdown`格式文章转换为`HTML`网页，配合[GitHub Pages](https://pages.github.com)的免费托管服务就可以搭建一个属于自己的[博客小站](https://apqx.me)了。

# 本地调试

在`_includes/head-common.html`中定义着网站使用的`JS`和`CSS`资源，它们是由内部的`npm`工程生成的，为提高访问速度而被托管到阿里云的`OSS`上。

本地调试时，需要修改这些资源为本地文件以实时响应`npm`工程的变化：

```html
<!-- css和js文件由内部的npm工程输出 -->
<!-- only for test -->
<link rel="stylesheet" href="{{ " /npm/dist/apqx.css" }}" />
<script type="text/javascript" src="{{ " /npm/dist/apqx.js " }}"></script>
<link rel="stylesheet" href="{{ " /css/materialFontsIcons.css " }}" />

<!-- 这里用Liquid隐藏掉这段指向阿里云托管的外部资源的代码 -->
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

安装[Jekyll](https://jekyllrb.com/docs/installation/macos/)后，启动服务：

```sh
# 启动jekyll服务，在http://localhost:4000即可访问生成的博客网站
bundle exec jekyll serve

# 切换到内置的webpack工程目录
cd npm
# 编译生成所需的js、css文件
npm run build
```

# 部署到GitHub Pages

调试完成后，如果`npm`工程生成了新的`JS`和`CSS`资源文件，需要更新阿里云`OSS`托管的旧文件，修改`_includes/head-common.html`以使用托管后的资源文件。

```html
<!-- css和js文件由内部的npm工程输出 -->
<!-- 这里用Liquid隐藏掉这段指向本地资源的代码 -->
{% comment %}
<!-- only for test -->
<link rel="stylesheet" href="{{ " /npm/dist/apqx.css" }}" />
<script type="text/javascript" src="{{ " /npm/dist/apqx.js " }}"></script>
<link rel="stylesheet" href="{{ " /css/materialFontsIcons.css " }}" />
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

把本地修改`commit`后`PUSH`到`GitHub`上，`GitHub Pages`会自动执行`Jekyll`的编译操作，就像本地调试时那样把`Markdown`文章转换为`HTML`页面并更新到指定的域名下。

```sh
git commit
git push origin
```