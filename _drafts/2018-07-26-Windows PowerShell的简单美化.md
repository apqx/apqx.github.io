---
layout: post
type: essy
title:  "Windows PowerShell的简单美化"
author: APQX
date:   2018-04-20 18:41:38 +0800
categories: essy
headpic: /assets/xbox_one_console.jpg
---

# Windows PowerShell的简单美化

## APQX

## 2018年7月26日

### 抱怨

我一直觉得微软在Terminal的配色上不用心，万年不变的cmd“大黑框”，到了PowerShell时代，又搞了个“大蓝框”，让我每次使用命令行都会怀念起Ubuntu，经典的红底配色，看起来就很舒服，用我的感觉来说，Ubuntu的Terminal会让我产生想敲键盘的冲动，Windows的PowerShell会让我产生想砸键盘的冲动o(*￣▽￣*)o。

<img class="materialboxed responsive-img" src="{{ "/assets/ubuntu_01.jpg" }}" alt="pic">

对于这些每天都要使用的工具，颜值是非常重要的，即使是古板的微软，也为cmd和PowerShell提供了一定的自定义能力，简单的改一些参数，就可以达到一个很好的效果。

<img class="materialboxed responsive-img" src="{{ "/assets/powerShell_01.jpg" }}" alt="pic">

### 自定义

在PowerShell的标题栏单击右键，就可以看到`属性`选项，就在这里对配色进行修改。

<img class="materialboxed responsive-img" src="{{ "/assets/powerShell_05.jpg" }}" alt="pic">

在Windows上，Consolas是一个很适合显示代码的字体，因为我的是4k显示器，所以字体大小选择18号，另外，我注意到似乎只有英文版的Windows可以在这里选择Consolas字体，中文版的话，选择黑体效果也很好，我确实不喜欢宋体。

<img class="materialboxed responsive-img" src="{{ "/assets/powerShell_03.png" }}" alt="pic">

PowerShell中可以自定义屏幕字体(Screen Text)、屏幕背景(Screen Background)、选中字体(Popup Text)和选中背景(Popup Background)四种元素的配色，每种元素都可以选择下面的16种颜色，当然，也可以在右侧定义这16种颜色的RGB值，来达到更好的效果。

<img class="materialboxed responsive-img" src="{{ "/assets/powerShell_02.png" }}" alt="pic">

这16种颜色就是将要显示在PowerShell中的所有颜色，选择不当可能会导致部分字体因对比度不够而难以辨认，所以，还是慎重一些，我目前选择的颜色是这样的，从左至右：

* 12,12,12
* 0,55,218
* 19,161,14
* 58,150,221
* 197,15,31
* 1,36,86
* 238,237,240
* 204,204,204
* 118,118,118
* 59,120,255
* 22,198,12
* 97,214,214
* 231,72,86
* 180,0,158
* 249,241,165
* 242,242,242

定义好了这些颜色，就可以给上面说的那四个元素选择配色了，我喜欢素雅的风格，这是我的选择：

* Screen Text : 238,237,240 白色
* Screen Background : 12,12,12 黑色
* Popup Text : 12,12,12 黑色
* Popup Background 238,237,240 白色

然后透明度调整到95%，保存后重启PowerShell，就会生效，看起来还挺不错的，我喜欢。

### 其他注意项

在Windows 10的资源管理器中，按住`Shit + 鼠标右键`，弹出的菜单中会出现`在当前位置打开PowerShell`选项，然后你会发现，这个PowerShell并没有应用刚刚设置的配色，我不知道深层次的原因，只是观察到，使用`Win + R`启动的PowerShell和这种方式启动的PowerShell似乎是独立的，所以，需要给它们单独设置配色。

<img class="materialboxed responsive-img" src="{{ "/assets/powerShell_04.jpg" }}" alt="pic">