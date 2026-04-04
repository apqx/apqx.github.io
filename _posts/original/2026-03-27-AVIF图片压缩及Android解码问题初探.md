---
layout: post
categories: original
title: "AVIF 图片压缩及 Android 解码问题初探"
author: 立泉
mention: 硬件编解码器 色域 AV1 ICC CICP YUV420
date: 2026-03-27 +0800
description: 博客图片同时提供小尺寸缩略图和全尺寸原图，为节省数据流量 thumb 缩略图已经转向 WebP，但顾及兼容性，尤其分享的摄影照片依旧使用 JPG。不过伴随填充「透镜」的照片数量增多，占用的 OSS 存储容量也在快速膨胀，为控制存储和带宽成本，切换到一种更高效的现代图片格式是必须考虑的事情。
cover: 
tags: Code Android AVIF AV1 ICC CICP 色域
published: true
---

我博客中的图片同时提供小尺寸缩略图和全尺寸原图，为节省数据流量 thumb 缩略图已经转向 WebP，但顾及兼容性，尤其分享的摄影照片依旧使用 JPG。不过伴随填充「透镜」的照片数量增多，占用的 OSS 存储容量也在快速膨胀，为控制存储和带宽成本，切换到一种更高效的现代图片格式是必须考虑的事情。

可选项有 3 个，基于 AV1 视频编码的 AVIF、基于 HEVC 视频编码的 HEIC 和传统 JPG 的升级版 JPEG XL。HEIC 由于源头 HEVC 的专利授权问题不会被开源届采用，Chrome 和 FireFox 至今没有提供对它的支持。JPEG XL 则因为早期与 Google 主推的 AVIF 冲突被从 Chrome 中移除，2025 年才开始被重新收录，真正达到广泛可用还需数年时间。

对比之下，AVIF 是当前在高效压缩和兼容性上的最佳选择。除支持现代格式应有的透明度、动态内容和 HDR 外，压缩率比基于上一代视频编码技术 VP8 的 WebP 更优秀，兼容性方面主流浏览器和操作系统也均已在 2022 年前后提供支持。

![](http://localhost:4000/assets/20260327/can_i_use_avif_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse AVIF" }

![](http://localhost:4000/assets/20260327/can_i_use_heic_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse HEIC" }

![](http://localhost:4000/assets/20260327/can_i_use_jpeg_xl_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse JPEG XL" }

## 转码与问题

AVIF 即 AV1 Image File Format，是 AV1 视频技术下的单帧图片，使用 AOMedia 官方提供的 libavif 工具可以方便的将其它格式的图片转换为 AVIF：

```sh
# 图片转码，质量 75%
avifenc -q 75 input.jpg output.avif
```

原本 4MB 的 JPG 转码后约 1.5MB，作为向外分享的原图十分合适。测试在 Safari、Chrome、FireFox 和 macOS、iOS 中都能正确显示，唯独 Android，在 Android 16 的文件管理器和 Google Photos 中均无法解码，而浏览器和一些第三方图片编辑器却是正常的。

Android 开发文档表明从 [Android 12 开始已经为 AVIF 提供系统级支持](https://developer.android.com/develop/ui/views/graphics/reduce-image-sizes){: target="_blank" }，网上搜索到的相关测试也没有提及兼容性问题，但为什么在我的设备和 Android 虚拟机上都无法显示呢？找到几篇当时对 AVIF 的测试文章，发现其中一部分照片可以正常解码，另一部分却不可以。尝试按照 Gemini 给出的思路排查但一直没有找到原因，直到把 Media Info 对图片的解析结果提交给 Gemini 3.1 Pro，从回应中注意到意料之外的一个关键点：图片尺寸。

AVIF 基于视频技术，移动端硬件解码器是面向 UHD 4K 标准设计的，为平衡功耗和内存占用对尺寸超过 3840x2160 的图像可能会拒绝解码，这就是使用系统硬件解码器的文件管理器和 Google Photos 不能显示的原因。而浏览器和一些第三方图片编辑器内部使用自带的 Skia 或 libavif 软解库，不受硬件解码器限制。

解决方法是在容器内部分割图片，各分区独立编解码，外部看来依然是一张完整图片。

```sh
# --grid 指定图片横向和纵向的分割数量
# 2x2 表示将 6000x4000 的图片分割为 4 个 3000x2000 的块分别编解码
avifenc -q 75 --grid 2x2 input.jpg output.avif
```

分割后图片即可在 Android 中正常硬解，但另一个问题接踵而至，颜色好像变淡了🤔。

Google Photos 中观察同一张照片的 JPG 和 AVIF 明显感到后者颜色不如前者鲜艳，而在 macOS 以及 Android 的浏览器中却是颜色一致的，所以应该还是硬件解码器的问题。

Gemini 给出的回应涉及很多诸如 YUV 420、BT.709、ICC Profile 和 CICP 标签的陌生概念，先理解它们的含义以及在编解码中的作用才能理解这个问题的根源所在，这也是接触音视频领域的契机。

## 何谓“图像”

所有文件都是存储在磁盘上的二进制数据，图片由像素数据和记录如何映射像素到真实颜色的“说明书”组成。根据图片格式的技术源头，这个“说明书”有两种，传统图片格式使用的 ICC Profile 和视频格式使用的 CICP 标签。

ICC Profile 即 International Color Consortium Profile 国际色彩联盟配置文件，是一个庞大的查表字典，里面记录着像素数据比如 RGB 数字与真实颜色的映射关系。通常说的显示器 Color Profile 也是指这部分内容，是存在于操作系统中的硬件色彩映射表，不同硬件对色彩的映射并不一致。一些专业显示器和打印机需要用仪器检测实际颜色与解码出的图片颜色的匹配度，调整硬件 ICC Profile 描述文件，即是“校色”。

JPEG、PNG 以及 WebP 这类相对传统的图片格式会内嵌一个 ICC Profile 作为色彩配置，由它决定图片色域是 sRGB 还是更宽泛的 P3。计算机显示图片时，首先读取文件像素数据和 ICC 描述文件，将像素数据转换为不受设备影响的绝对参考值（Profile Connection Space, PCS），再根据显示器或打印设备自身的硬件 ICC 描述文件决定实际使用的颜色。

