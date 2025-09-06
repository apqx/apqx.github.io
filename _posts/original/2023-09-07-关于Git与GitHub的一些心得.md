---
layout: post
categories: original
title: "关于 Git 与 GitHub 的一些心得"
author: 立泉
mention: 身份验证 分支关联 SSH 
date: 2023-09-07 +0800
description: 软件开发者对 Git 不会陌生，它是现代最受欢迎的开源分布式版本控制工具，典型使用场景下，多个客户端从中央仓库 pull 拉取代码副本，各自开发`commit`再`push`到中央仓库。“分布式”的意思是各个客户端的开发互相独立，分布进行，只在需要时与中央仓库同步。
cover: https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20230605/github_url_ssh_thumb.jpg
tags: Code Git GitHub SSH
---

软件开发者对 Git 不会陌生，它是现代最受欢迎的开源分布式版本控制工具，典型使用场景下，多个客户端从中央仓库`pull`拉取代码副本，各自开发`commit`再`push`到中央仓库。“分布式”的意思是各个客户端的开发互相独立，分布进行，只在需要时与中央仓库同步。

GitHub 是基于 Git 的远程代码托管平台，开发者把代码放在它上面便于分享协作，其提供的免费私有仓库可作为本地工程的额外备份空间。工程之外，用 Git 管理文本天生可溯源，每一个文件的每一次修改提交都有记录，能在版本间灵活跳跃，撤销更改非常方便。我的[个人笔记]({% link _posts/original/2020-07-10-记笔记与写博客.md %}){: target="_blank" }就是以 Markdown 文本存储在 GitHub 私有仓库中，搭配一款文本编辑器组成最适合自己的跨平台笔记方案。

如何使用 GitHub 是一个基础问题，但就像刚接触 Vim 一样，初始操作是一切可能性的开始，其中一些问题值得单独拿出来记录。

## 身份验证

远程仓库与本地建立关联后，本地`push`会更改其托管内容，所以身份验证十分重要，只有被验证拥有权限的用户才能执行操作。

GitHub 鉴权有三种方式，常规的用户名 + 密码、服务端生成的授权 token 和基于非对称加密的 SSH key。

### 用户名 + 密码

默认情况下，如果链接远程仓库是通过`https://github.com/*`而非 SSH 的`git@github.com:*`，向其`push`会触发 GitHub 要求输入用户名和密码验证身份。这种方式非常直观，但每次`push`都要求重新输入验证。

如果要 Git 记住用户名和密码，需要为每个仓库逐一设置`git config`。

```sh
# 在每个仓库目录下执行
git config --global credential.helper store
```

### 授权 token

授权 token 在 GitHub 中配置生成，可指定权限范围，包括从访问用户仓库列表到创建、删除仓库在内的一系列危险操作。它和用户名 + 密码一样通常被 IDE 使用以在本地管理远程仓库，比如 IntellJ IDEA 在创建工程时可直接从用户的 GitHub 仓库中`clone`。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20230605/idea_github_repository.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Intellij Idea GitHub Repository" }

### SSH key

相比之下，基于非对称加密的 [SSH key 则是一种更方便的无密码验证方式]({%  link _posts/original/2019-06-11-基于非对称加密的HTTPS与SSH.md %}){: target="_blank" }。只需用`ssh-keygen`生成一对密钥，私钥保存在本地，公钥上传到 GitHub，鉴权时一端发送一段密文，如果另一端能够解密即验证成功。

使用这种机制要求指向远程仓库的链接是符合`git@github.com:*`的 SSH 格式。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20230605/github_url_ssh_thumb.jpg){: loading="lazy" class="clickable clickShowOriginalImg" alt="GitHub SSH URL" }

## 建立关联

曾经有一段时间如何把本地仓库和远程仓库建立关联让我十分费解，不过现在一切都清晰明朗，用几种典型情况说明。

### 克隆

最常见的场景是`clone`一个 GitHub 仓库到本地，这种情况下本地仓库是自动与远程仓库绑定的，仓库目录下执行`git remote -v`能看到名为 origin 的远程仓库：

```sh
# 查看远程仓库
git remote -v
# 输出
origin	https://github.com/apqx/apqx.github.io.git (fetch)
origin	https://github.com/apqx/apqx.github.io.git (push)
```

应当注意，`clone`的是远程仓库的默认分支，如果要访问其它分支需手动从远程分支创建，这样新建的本地分支会自动与它所基于的远程分支关联：

```sh
# 基于远程 origin/dev 分支在本地创建一个 dev 分支
# 则本地 dev 分支自动与该远程分支关联
git branch dev origin/dev
# 切换到 dev 分支后，commit 会被正确 push 到对应的 origin/dev 分支
git checkout dev
git push
```

本地仓库目录下有一个隐藏的`.git`目录，里面存储着当前仓库的 Git 配置信息，在`.git/config`中可看到链接的远程仓库：

```sh
[remote "origin"]
	url = https://github.com/apqx/apqx.github.io.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
	remote = origin
	merge = refs/heads/master
```

可把这个`.git`目录复制到任何一个目录下，则该目录就变成一个链接对应远程仓库的本地 Git 仓库。Git 会检查当前目录相对于`HEAD`所指向`commit`版本的文件变化，等待用户的新`commit`提交。

### 手动关联

另一个常见场景是在本地创建 Git 仓库托管到 GitHub 上，首先为本地工程创建仓库：

```sh
# 工程根目录下，初始化 Git，创建本地仓库
git init
```

`commit`提交代码：

```sh
# 把指定文件及其修改添加到 git 记录中
# 这里的 . 表示目录下所有文件，应配合 .gitignore 排除不记录的二进制文件
git add .
# commit 提交
# 应注意只有进行过 commit 的仓库，其分支才可以链接
git commit -m "First commit"
```

与远程仓库建立关联分为 2 步，添加远程仓库和把本地分支与远程分支关联。

在 GitHub 上创建远程仓库时不要选择添加`.gitignore`和`README.md`，会导致其自动为这两个文件的创建产生`commit`记录，没有必要，在本地仓库添加它们更合适。

从某个时间节点开始 GitHub 创建的仓库默认是 main 分支，而本地创建则默认是 master，为保持一致建议在本地有过`commit`之后修改 master 分支名为 main：

```sh
# 本地有过 commit 记录后，master 分支是有效的
# 重命名为 main
git branch -m master main
```

建立关联的第 1 步先添加远程仓库，注意如果要配合 SSH key 免密码鉴权需要使用类似`git@github.com:apqx/*`的 SSH 格式：

```sh
# 为本地仓库添加远程仓库，并命名为 origin
# 这种 URL 格式可以使用 SSH key 免密码鉴权
git remote add origin git@github.com:apqx/apqx.github.io.git
# 拉取远程仓库的可读信息，这个操作是必要的，否则本地看不到远程仓库的分支
git fetch

# 可以查看已添加的远程仓库
git remote -v
# 可以查看所有远程仓库的分支
git branch -r
```

第 2 步将本地分支与远程分支建立关联，根据远程分支是否存在分为 2 种情况：

```sh
# 一，远程仓库不存在该分支，比如 main，在远程仓库没有 commit 记录的情况下是不存在的
# 即创建仓库时没有选择添加 .gitignore 或 README.md 时，main 分支不存在
# 可直接将本地当前分支 push 到指定的远程分支上，因为该分支不存在，所以会被自动创建
# 同时这 2 个分支自动建立关联
git push -u origin main

# 二，远程仓库存在该分支，比如 main
# 则不能直接把本地分支 push 到指定的远程分支上，需要先处理冲突
# 设置本地分支对应的远程分支，本地 main 对应远程的 origin/main
git branch --set-upstream-to=origin/main main
# 拉取远程分支的 commit 信息与本地合并，需要处理可能的冲突
# 第一次拉取时要加 --allow-unrelated-histories，来允许合并这 2 个本来毫无关联的分支信息
git pull --allow-unrelated-histories
# 执行完成后 2 个分支即建立关联
```

如果本地新增分支，可像上面第 1 种情况那样直接`push`到远程仓库里：

```sh
# 比如本地有一个新的 dev 分支要 push 到远程仓库
# 切换到该分支
git checkout dev
# push 到远程仓库的 dev 分支中
# 因为远程仓库不存在该分支，所以不会有冲突，自动在远程创建并建立关联
git push -u origin dev
```

删除本地分支和远程分支也很简单：

```sh
# 删除指定的本地分支
git branch -d <branch-name>
# 删除指定的远程分支
git push origin --delete <branch-name>
```

## 尾声

GitHub 在被微软并入后功能迭代更加活跃，已经在之前博文中提过 Github Pages，排除今天写的部分还有一些如 Fork 和 Action 功能没有涉及。最近计划的一个东西需要用到它们，做完会把相关心得分享出来。