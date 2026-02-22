# 立泉落落

[![Deploy Jekyll site to Pages](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/apqx/apqx.github.io/actions/workflows/jekyll.yml)

由 [Jekyll](https://jekyllrb.com) 驱动的静态博客，参考 [Material Design](https://material.io) 设计风格，使用 [Material Components Web](https://github.com/material-components/material-components-web) 框架。

并非通用博客模版，而是以我自己的喜好量身定制，由随笔、转载、诗文、看剧、透镜 5 个板块组成，应用平淡极简风格，在文字、色彩和动画之外不添加多余元素。可作为 Material Design 个人站参考，但不建议直接套用，尚未进行模版改造。

主页：

![立泉落落](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_index_original.webp)

看剧：

![立泉落落｜看剧](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_index_opera.webp)

透镜：

![立泉落落｜透镜](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_index_lens.webp)

## Markdown

博文以 Markdown 格式撰写，由 Jekyll 转换为 HTML 网页：

![立泉落落](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_post.webp)

关联标签：

![立泉落落](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_post_relative.webp)

## Pagefind

站内搜索功能基于 Pagefind 实现，需要先扫描站点生成索引文件：

```sh
# 进入博客根目录
# 删除旧索引
rm -rf npm/pagefind
# 在 Jekyll 生成网站后扫描博客文章生成新索引
# 扫描目录为 Jekyll 的站点目录 _site/，输出目录为 npm/pagefind/
pagefind --site _site --output-path npm/pagefind
```

## 本地调试

工程由 Vite 和 Jekyll 组成，Vite 用于生成网站所需的 Javascript 和 CSS 资源，Jekyll 则用来将 Markdown 文章转换为 HTML 网页，生成可部署的静态站点。

### Vite

切换到内部 Vite 工程目录，编译生成 JS 和 CSS：

```sh
# 进入内部 Vite 工程
cd npm
# 安装所需依赖
npm install
# 执行编译，在 npm/dist/ 目录下生成 JS、CSS
npm run build
```

网站部署时这些资源文件被托管到阿里云 OSS 上以提高中国大陆的访问速度，在`_includes/configure.html`和`_includes/head.html`中定义。

环境变量`JEKYLL_ENV`可控制工程处于`Development`或`Production`模式。`Development`模式下 Jekyll 生成的网页会在`<header></header>`中引用本地资源，JS 日志也会输出到浏览器 Console 中。`Production`模式下则使用托管在云上的资源并关闭 JS 日志输出。

```html
<!-- _includes/configure.html -->

<!-- Jekyll 编译时的模版文件 -->
<!-- 检测 JEKYLL_ENV 环境变量写入网页 <head>，从而控制整个站点是否处于生产模式 -->
{% assign debug = true -%}
{% if jekyll.environment == "production" -%}
  {% assign debug = false -%}
{% endif -%}
```

### Jekyll

安装 [Jekyll](https://jekyllrb.com/docs/installation/macos/)，启动本地服务：

```sh
# 安装 Gemfile 中定义的 Jekyll 及所需插件
bundle install
# 启动 Jekyll 服务，自动调用浏览器进入博客
# http://localhost:4000
bundle exec jekyll serve -l -o --trace --draft
```

Jekyll 会在`_site/`目录下生成静态网站，并 serve 到本地 4000 端口：

```sh
http://localhost:4000
```

`JEKYLL_ENV`未设置时`jekyll serve`和`jekyll build`均以开发模式生成站点，一些插件为减少构建时间可能不会执行完整功能，需设置`JEKYLL_ENV`的值为`production`：

```sh
# 生产模式 serve
JEKYLL_ENV=production bundle exec jekyll serve -l -o --trace --draft
# 生产模式 build
JEKYLL_ENV=production bundle exec jekyll build --trace
```

具体命令在`.vscode/tasks.json`中均有定义。

## 部署到 GitHub Pages

调试完成后，把 Vite 生成的新 JS 和 CSS 文件上传到 OSS 中，以生产模式生成站点。

工程`push`到自己的 repository，GitHub Pages 会自动设置`JEKYLL_ENV=production`执行`jekyll build`生成静态网站：

```sh
git push
```

静候数秒或数分钟，取决于 Pages 执行速度，完成后网站即会更新。

![立泉落落](https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/screenshots/blog_index_original_phone.webp)

## 开源与版权

博客代码以 GPL-3.0 协议开源，但 [_posts](./_posts/) 目录下的原创文章以 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) 协议保留著作权，对其中摄影照片保留版权，未经允许不可作商业用途。