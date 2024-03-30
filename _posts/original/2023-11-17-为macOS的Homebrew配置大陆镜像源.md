---
layout: post
categories: original
title: "为macOS的Homebrew配置大陆镜像源"
author: 立泉
mention: 包管理器 阿里云 清华大学
date: 2023-11-17 +0800
description: Homebrew之于macOS正如apt之于Ubuntu，且正如apt在大陆面临的网络问题一样，Homebrew也面临着相近甚至更糟的网络问题，因为它默认的源居然就是“剪不断、理还乱”的GitHub和GitHub Packages...
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20231117/homebrew_social_cardcard_thumb.jpg
tags: Code Git macOS Homebrew GitHub 阿里云 清华大学 镜像源
---

`Homebrew`之于`macOS`正如`apt`之于`Ubuntu`，且正如`apt`在大陆面临的网络问题一样，`Homebrew`也面临着相近甚至更糟的网络问题，因为它默认的`源`居然就是“剪不断、理还乱”的`GitHub`和`GitHub Packages`...后面会提到。

[Homebrew](https://brew.sh){: target="_blank" }是`macOS`的包管理器，但并没有被其内置，需要手动安装:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

从官方脚本来看其实就是把`Homebrew`的`GitHub`仓库`clone`下来，再把`brew`可执行文件映射到环境变量目录里。`clone`后所在的目录被称为`prefix`目录，在`x86`芯片的`Mac`上是`/usr/local/`，而在使用`Apple Silicon`的`Mac`上为了和`Rosetta`转译的包共存被改为`/opt/homebrew/`。其源码和可执行文件就位于`[prefix]/Homebrew/`之中，通过它安装的包都被保存在`[prefix]/Cellar/`目录里。

## 术语

`Homebrew`直译为“家酿啤酒🍺”，之所以取这么泛化的名字[据说](https://docs.brew.sh/FAQ#homebrew-is-a-poor-name-its-too-generic-why-was-it-chosen){: target="_blank" }是因为当初作者根本没想到它之后会变得如此受欢迎，想要更改的时候已经来不及了...其实不仅仅这个名字，它所使用的术语也不是通用的`package`之类，而真的是一堆很形象的“酿酒”词...

**prefix**

前面提过是`Homebrew`的安装目录，通过`brew`安装的包都不会超出这个目录。

包会被安装到`[prefix]/Cellar/`中然后通过`symlink`软链接将其可执行文件和其它必要文件映射到`[prefix]/`里，因为可执行文件所在的`[prefix]/bin/`本身是环境变量`$PATH`的一部分，所以这个包也就能被外部使用。

**formulae**

直译“酿酒配方”，是安装时要从上游源码编译的包定义，现场酿酒。

这些包定义是通过一个`GitHub`仓库来管理的:

```sh
https://github.com/homebrew/homebrew-core
```

每个包都对应其中一个记录其属性的`Ruby`文件，通过`brew`安装要先从此仓库`pull`下来整个包列表所以会特别慢...

即然包列表就是一个`git`仓库，那么如果要上传自己的包到`Homebrew`就只需把自定义包文件`push`到这个仓库里即可，这也是`Homebrew`和其它包管理器很不一样的地方。

**cask**

直译“酒桶”，是`macOS`使用的原生包定义，和`formulae`一样也是通过`GitHub`仓库管理:

```sh
https://github.com/homebrew/homebrew-cask.git
```

**bottle**

直译“酒瓶”，是预编译好的二进制包，酿好的酒。

这些包都被托管在`GitHub Packages`上:

```sh
https://github.com/Homebrew/homebrew-core/packages
```

**cellar**

直译“酒窖”，是包的安装目录，也就是藏酒的地方:

```sh
[prefix]/Cellar/
```

**keg**

直译“装酒的小桶”，无论是现酿的酒`formulae`还是酿好的酒`bottle`，都要被`pour`倾倒到小酒桶`keg`放入地窖`cellar`储存，其实是指定包的指定版本的目录。

```sh
# 指定包的指定版本的目录
[prefix]/Cellar/kotlin/1.9.20/
```

使用`Homebrew`可能会经常看到`keg-only`这个词，意思是酒仅仅是被储存在酒窖里了，但并不能被外界使用，也就是说`brew`安装第二步将该包的可执行文件`symlink`软链接到`[prefix]/bin/`中并没有进行。原因可能是里面已经有同名文件，比如`macOS`自带的`git`也会软链接到这里，如果想使用`brew`安装的新版本`git`，需要按照提示执行`brew link`，但是建议在执行覆盖前先`--dry-run`检查一下可能会被影响的文件。

```sh
# 将git链接到[prefix]的对应目录，覆盖已有文件
brew link --overwrite git
# 检查并输出会被影响的文件
brew link --overwrite --dry-run git
```

对于一些不能使用软链接覆盖的包比如`openjdk`，可以通过手动将其路径添加进环境变量的方式解决。

```sh
brew info openjdk

==> openjdk: stable 21.0.1 (bottled) [keg-only]
Development kit for the Java programming language
https://openjdk.java.net/
/usr/local/Cellar/openjdk/21.0.1 (600 files, 331.4MB)
  Poured from bottle using the formulae.brew.sh API on 2023-11-13 at 01:24:39
From: https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git/Formula/o/openjdk.rb
License: GPL-2.0-only with Classpath-exception-2.0
==> Dependencies
Build: autoconf ✔, pkg-config ✔
Required: giflib ✔, harfbuzz ✔, jpeg-turbo ✔, libpng ✔, little-cms2 ✔
==> Requirements
Build: Xcode (on macOS) ✔
Required: macOS >= 10.15 (or Linux) ✔
==> Caveats
For the system Java wrappers to find this JDK, symlink it with
  sudo ln -sfn /usr/local/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk

openjdk is keg-only, which means it was not symlinked into /usr/local,
because macOS provides similar software and installing this software in
parallel can cause all kinds of trouble.

If you need to have openjdk first in your PATH, run:
  echo 'export PATH="/usr/local/opt/openjdk/bin:$PATH"' >> ~/.zshrc

For compilers to find openjdk you may need to set:
  export CPPFLAGS="-I/usr/local/opt/openjdk/include"
```

**rack**

直译“装着很多小酒桶的支架”，其实是指定包的目录，它会包含很多版本`keg`。

```sh
# rack
[prefix]/Cellar/kotlin/
# kegs
[prefix]/Cellar/kotlin/1.9.20/
[prefix]/Cellar/kotlin/1.9.21/
```

**tap**

直译“阀门”，比如`formulae`和`bottle`的来源：

```sh
https://github.com/homebrew/homebrew-core
https://github.com/Homebrew/homebrew-core/packages
```

修改镜像源正是通过`brew tap`来实现的。

## 大陆镜像

现在我们知道为什么`brew install`这么慢了，不仅仅是从`GitHub`拉取代码和下载`package`，在4.0版本之后每次执行操作都会去`https://formulae.brew.sh/api/`获取完整的包信息，使用镜像源就是要将这些地址全都改为大陆链接。推荐我自用十分稳定的[清华大学](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/){: target="_blank" }镜像站，它的文档比[阿里云](https://developer.aliyun.com/mirror/homebrew){: target="_blank" }更完整，而且很奇怪我之前尝试`阿里云`的`Homebrew`源均是`404`...不知道现在是什么状态。

首先编辑`~/.zshrc`添加这些`brew`使用的环境变量:

```sh
export HOMEBREW_API_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles"
export HOMEBREW_PIP_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple"
```

应用配置:

```sh
. ~/.zshrc
```

使用`brew tap`进一步修改源地址:

```sh
# 注：自 brew 4.0 起，大部分 Homebrew 用户无需设置 homebrew/core 和 homebrew/cask 镜像，只需设置 HOMEBREW_API_DOMAIN 即可。
# 如果需要使用 Homebrew 的开发命令 (如 `brew cat <formula>`)，则仍然需要设置 homebrew/core 和 homebrew/cask 镜像。
# 请按需执行如下两行命令：
brew tap --custom-remote --force-auto-update homebrew/core https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git
brew tap --custom-remote --force-auto-update homebrew/cask https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask.git
# 除 homebrew/core 和 homebrew/cask 仓库外的 tap 仓库仍然需要设置镜像
brew tap --custom-remote --force-auto-update homebrew/cask-fonts https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask-fonts.git
brew tap --custom-remote --force-auto-update homebrew/cask-versions https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-cask-versions.git
brew tap --custom-remote --force-auto-update homebrew/command-not-found https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-command-not-found.git
brew tap --custom-remote --force-auto-update homebrew/services https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-services.git
```

试试更新，芜湖起飞🚀。

```sh
brew update
```