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

我博客中的图片同时提供小尺寸缩略图和全尺寸原图，为节省数据流量 thumb 缩略图已经转向 WebP，但顾及兼容性，尤其分享的摄影照片依旧使用传统 JPG。不过伴随填充「透镜」的照片数量增多，占用的 OSS 存储容量也在快速膨胀，为控制存储和带宽成本，切换到一种更高效的现代图片格式是必须考虑的事情。

可选项有 3 个，基于 AV1 视频编码的 AVIF、基于 HEVC 视频编码的 HEIC 和 JPG 的升级版 JPEG XL。HEIC 由于源头 HEVC 的专利授权问题不会被开源届采用，Chrome 和 FireFox 至今没有提供对它的支持。JPEG XL 则因为早期与 Google 主推的 AVIF 冲突被从 Chrome 中移除，2025 年才开始被重新收录，真正达到广泛可用还需数年时间。

对比之下，AVIF 是当前在高效压缩和兼容性上的最佳选择。除支持现代格式应有的透明度、动态内容和 HDR 外，压缩率比基于上一代视频编码技术 VP8 的 WebP 更优秀，兼容性方面主流浏览器和操作系统也均已在 2022 年前后提供支持。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20260327/can_i_use_avif_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse AVIF" }

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20260327/can_i_use_heic_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse HEIC" }

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20260327/can_i_use_jpeg_xl_thumb.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Screenshot of caniuse JPEG XL" }

## 转码与问题

AVIF 即 AV1 Image File Format，是 AV1 视频技术下的单帧图片，使用 AOMedia 官方提供的 libavif 工具可以方便的将其它格式的图片转换为 AVIF：

```sh
# 图片转码，输出时编码质量 75%
avifenc -q 75 input.jpg output.avif
```

原本 4MB 的 JPG 转码后约 1.5MB，作为向外分享的原图十分合适。测试在 Safari、Chrome、FireFox 和 macOS、iOS 中都能正确显示，唯独 Android，在我的红米 Android 16 测试机的文件管理器和 Google Photos 中均无法解码，而浏览器和一些第三方图片编辑器却是正常的。

Android 开发文档明确显示从 [Android 12 开始已经为 AVIF 提供系统级支持](https://developer.android.com/develop/ui/views/graphics/reduce-image-sizes){: target="_blank" }，网上搜索到的相关测试并没有提及兼容性问题，但为什么在我的设备和 Android 虚拟机上都无法显示呢？找到几篇当时对 AVIF 的测试文章，发现其中一部分照片可以正常解码，另一部分却不可以。尝试按照 Gemini 给出的思路排查，一直没有找到原因，直到把 Media Info 对图片的解析结果提交给 Gemini 3.1 Pro，从回应中注意到意料之外的一个关键点：图片尺寸。

AVIF 基于视频技术，移动端硬件解码器是面向 UHD 4K 标准设计的，为平衡功耗和内存占用对尺寸超过 3840x2160 的图像可能会拒绝解码，这就是使用系统硬件解码器的文件管理器和 Google Photos 不能显示的原因。而浏览器和一些第三方图片编辑器内部使用自带的 Skia 或 libavif 软解库，不受硬件解码器限制。

解决方法是在容器内部分割图片，各分区独立编解码，外部看来依然是一张完整图片。

```sh
# --grid 指定图片横向和纵向的分割数量
# 2x2 表示将 6000x4000 的图片分割为 4 个 3000x2000 的区块分别编解码
# 理论上图片尺寸应该是分割数量的整数倍，avifenc 会自动用透明像素补齐缺失部分
# 并在输出 AVIF 文件中标明有效区域以确保解码器正确显示
avifenc -q 75 --grid 2x2 input.jpg output.avif

# 使用 ffprobe 查看分割信息
ffprobe -show_frames output.avif
```

分割后图片即可在 Android 中正常硬解，但另一个问题接踵而至，颜色好像变淡了🤔。

Google Photos 中观察同一张照片的 JPG 和 AVIF 明显感到后者颜色不如前者鲜艳，而在 macOS 以及 Android 浏览器中却颜色一致，所以应该还是硬件解码器的问题。

Gemini 给出的回应涉及很多诸如 YUV 420、BT.709、ICC Profile 和 CICP 标签的陌生概念，先理解它们的含义以及在编解码中的作用才能理解这个问题的根源，这也是一个接触音视频领域的契机。

## 何谓“图像”

文件是存储在磁盘上的二进制数据，使用时按指定方式解析，对于图片文件，是由 RGB 像素数据和记录如何映射 RGB 数字到真实颜色的“说明书”组成。根据图片格式的技术源头，“说明书”有两种，传统图片格式使用的 ICC Profile 和视频格式使用的 CICP 标签。

无论哪种方式，图片的解码过程都需要先从二进制文件获得代表每一个像素颜色的 RGB 数字（一般是 YUV 解码），再以指定的映射方式（sRGB 或 P3）在三原色坐标轴上定位到 RGB 数字对应的颜色，完成数字到颜色的转换。 

### 色彩编码

众所周知颜色由红绿蓝 3 个通道组合的 RGB 数字表示，每个通道占用 1 个字节，数字范围 0 ~ 255，则 1 个十六进制的纯白色 #FFFFFF 像素会占用 3 个字节。简单计算，如果一张 6000x4000 分辨率图片的全部像素以 RGB 方式存储，需要占用 6000 x 4000 x 3 / 1000 / 1000 = 72 MB，显然与印象中几 MB 的 JPG 照片相差甚远。实际上只有一些无损格式比如 PNG 才会直接存储 RGB 数字，而且要再加 1 个表示透明度的 Alpha 通道，导致体积巨大。常见的 JPG、WebP 都属于有损格式，存储经过压缩的 YUV 像素数据以减少体积便于传输和保存。

YUV 是一种被广泛应用的色彩编码、压缩方式，它利用人眼对亮度变化敏感而对色彩相对迟钝的特点，将亮度 Y 和色度 UV 分离，通过色度抽样丢弃超过半数的色度信息实现颜色压缩。

比如 YUV 4:2:0，它以 4x2 的像素矩阵作为采样单元，第 1 行像素只采样 2 个色度点，第 2 行采样 0 个色度点复用第 1 行的数据，这样在人眼几乎无法察觉到画质损失的情况下直接减少了 50% 的数据量。这种方式只在文字和截图场景可能出现较明显的边缘模糊，此时可考虑采用无损的 YUV 4:4:4。

图片属性中的 Pixel Format 即是色彩编码，通常是 yuv420p 或 yuv444p，分别对应有损采样压缩的 YUV 4:2:0 和无损采样的 YUV 4:4:4。 

要注意的是，使用 avifenc 对照片进行 YUV 4:2:0 压缩时必须确保图片尺寸和 --grid 分割后的区块尺寸都是 2 的整数倍，若某一方向的分割数量为 n，则该方向的图片尺寸必须是 2 * n 的整数倍。

在图片进入转码流程之前先进行裁剪：

```sh
# 伪代码，若区块最大尺寸为 2000，计算符合要求的图片宽度
val splitCount = width / 2000 + 1
# 除法去除余数再乘回来，获得符合要求的稍小尺寸
val newWidth = width / splitCount / 2 * splitCount * 2

# 使用 ffmpeg 从中心裁剪指定尺寸，输出 PNG 无损图片，编解码 PNG 可能会很慢
ffmpeg -i input.jpg -vf "crop=newWidth:newHeight" -y -c:v png cropped.png
# ffmpeg 是面向视频设计的，处理图片时会丢失 ICC Profile 和 EXIF 元数据，需要借助 ExifTool 从原图复制
exiftool -TagsFromFile input.jpg -icc_profile -exif:all cropped.png
# 而且使用滤镜裁剪图片需配置对应的颜色参数否则处理后可能出现颜色发灰

# 相比之下针对图片处理的 ImageMagick 是更好的选择，它会自动保留 ICC 和 EXIF
# -quality 指定 2 个数字，11 是做中间无损产物比较好的平衡点
# 第 1 个数字 0～9 代表 zlib 压缩级别，0 最快且不压缩，9 最慢且体积最小
# 第 2 个数字 0～5 代表 PNG 的预测过滤器类型，1 (Sub) 或 0 (None) 计算最快
magick input.jpg -gravity center -crop 800x600+0+0 +repage -quality 11 cropped.png
```

另外，部分移动端硬件解码器可能只支持 YUV 4:2:0 的 AVIF，使用 YUV 4:4:4 的图片无法硬解。

### 色域

Color Gamut 色域用来描述设备能显示的颜色范围，它会决定 RGB 数字实际对应的具体颜色，即同一个 RGB 数字在不同色域下对应的颜色是不一样的，处理图片时必须注意色域对齐。

sRGB 和 Display P3 是图片领域的 2 种色域，后者比前者多出约 25% 的颜色空间，能够还原更接近真实的自然色彩。相对的，视频领域通常使用 BT.709 和 BT.2020，前者能表示的色彩范围约等于 sRGB，后者范围则比 P3 更宽广，而且是 HDR 标准的基石。

### 色阶

Color Range 色阶用来描述 RGB 数字与纯黑、纯白的关系，有 Full Range 和 Limited Range 两种标准。

Full Range 0～255 全色阶主要用在计算机图像领域，数字 0 代表像素完全不发光的纯黑，255 代表屏幕最大亮度的纯白。

Limited Range 16-235 受限色阶主要用在电视领域，数字 16 为纯黑，数字 235 为纯白。为兼容老旧设备和视频数据，这个标准在新视频编码（H.264、HEVC、AV1）中被保留下来并成为默认选项。

对于传统图片格式 JPG、PNG、WebP，在 ICC Profile 里天生是 Full Range，无论 sRGB / P3。

对于 AVIF 这类基于视频技术的新格式，没有标记 Full Range 即默认是视频的 Limited Range，所以需要显示标记：

```sh
# 全色阶
avifenc -q 75 --yuv 420 --grid 2x2 --range full --cicp 12/13/1 input.jpg output.avif
```

### ICC Profile

ICC Profile 即 International Color Consortium Profile 国际色彩联盟配置文件，是一个详细的查表字典，里面记录着 RGB 像素数据与真实颜色的映射关系。通常说的显示器 Color Profile 也是指这部分内容，是存在于操作系统中的硬件色彩映射表，不同硬件对色彩的映射并不一致。一些专业显示器和打印机在使用前需要用仪器检测实际颜色与图片解码颜色的匹配度，调整硬件 ICC Profile，即是“校色”。

JPEG、PNG 以及 WebP 这类相对传统的图片格式会内嵌一个标准 ICC Profile 作为色彩配置，由它决定图片色域是 sRGB 还是更宽泛的 Display P3。计算机显示图片时，首先读取/计算文件像素数据和 ICC Profile，将像素数据转换为不受设备影响的绝对参考值（Profile Connection Space, PCS），再根据显示器或打印设备自身的硬件 ICC 描述文件决定实际使用的颜色。

这些图片格式如果 ICC 缺失，业界通常默认以 sRGB 模式处理，即不带 ICC 的图片会被视为 sRGB 色域。像素数据和 ICC Profile 映射表必须匹配才能解析出正确的颜色，如果要将 P3 色域的图片转换为兼容性更好的 sRGB，不能直接替换 ICC Profile，必须对 sRGB 范围之外的像素数据作裁剪，对范围之内的像素数据作色域对齐转换：

```sh
# 将 Display P3 色域图片窄化转换为 sRGB 色域的两种方式

# 使用 ImageMagick 重新计算像素数据并嵌入新的 ICC Profile
# 现代操作系统已经内置标准的 sRGB 和 P3 ICC Profile
# 在 macOS 中的路径为 /System/Library/ColorSync/Profiles
magick convert input_p3.jpg -profile sRGB.icc output_srgb.jpg

# 或者使用 FFmpeg 以视频领域所用的方式（即 CICP）重新计算像素数据，它会删除原有的 P3 ICC Profile
# 需指定 3 个输入参数和 3 个输出参数
# iprimaries=smpte432：声明输入图片的 Color Primaries 原色为 Display P3，FFmpeg 中 P3 色度坐标由 smpte432 标识
# itrc=srgb：声明输入图片的 Transfer Characteristics 传输曲线为 sRGB，P3 色域使用的也是这个曲线
# ispace=bt709：声明输入图片的色彩矩阵，JPEG 通常使用 YUV 色彩空间，这里设为通用的 bt709
# primaries=bt709：指定输出图片的目标原色为 sRGB，sRGB 的色度坐标与 bt709 完全一致
# trc=srgb：指定输出图片的传输曲线保持 sRGB 不变
# space=bt709：指定输出图片的色彩矩阵
ffmpeg -i input_p3.jpg -vf "colorspace=iprimaries=smpte432:itrc=srgb:ispace=bt709:primaries=bt709:trc=srgb:space=bt709" -c:v mjpeg -q:v 2 output_srgb.jpg
```

### CICP

ICC Profile 是传统图片格式的色彩映射方式，CICP 则是传统视频领域的色彩映射方式。

CICP 即 Coding-Independent Code Points 独立于编码的代码点，它不使用 ICC 那样的庞大字典，而是通过几个代表标准数学公式的数字标签来定义映射。

比如 sRGB 的 1/13/6，3 个数字分别代表 Primaries、Transfer 和 Matrix：

* Primaries 原色用于指定图片色域。
    * sRGB 色域使用数字 1，对应 ffmpeg 的 color_primaries: bt709。
    * P3 色域使用数字 12，对应 ffmpeg 的 color_primaries: smpte432。

* Transfer 传输曲线用于指定非线性 RGB 与线性 RGB 的转换方式。
    * sRGB 色域和 P3 色域都使用数字 13，对应 ffmpeg 的 color_transfer: iec61966-2-1。

* Matrix 转换矩阵用于指定图片编码 YUV 与 RGB 的转换方式。
    * 对于 YUV 420 有损采样压缩：
    * sRGB 色域使用数字 6，对应 ffmpeg 的 color_space: smpte170m。
    * P3 色域使用数字 1，对应 ffmpeg 的 color_space: bt709。
    * 对于 YUV 444 无损采样，使用数字 0，代表无需转换。

这 3 个参数决定照片编解码时的 3 个关键步骤，以解码为例，通过 3 个公式把 YUV 数据转换为真实颜色：

* 通过 Matrix 矩阵将像素数据从 YUV 编码转换为 RGB 数据。

* 通过 Transfer 传输曲线将非线性 RGB 转换为线性 RGB。

* 通过 Primaries 原色确定图片色域。

CICP 专为 H264、HEVC、AV1 这类视频流媒体设计，基于视频技术的图片（如 AVIF）自然也可以用它映射颜色。

## AVIF

理解上述内容后，将一张 P3 色域 JPG 图片转换为 AVIF 的正确方式如下：

```sh
# 先对图片进行缩放处理以符合 YUV 4:2:0 要求
ffmpeg -i input.jpg -vf "crop=newWidth:newHeight" -y -c:v png cropped.png
# 转换格式，解码、重编码，保留 ICC 和 CICP
avifenc -q 75 --yuv 420 --grid 2x2 --range full --cicp 12/13/1 cropped.png output.avif
```

只剩下一个问题，为什么 Android 硬解颜色会变淡？理论上 P3 色域的 RGB 值以 sRGB 方式解析出的颜色是偏淡的，可能在从 MediaCodec 硬解到 SurfaceFlinger 显示的过程中使用了错误的色域。

根据 Gemini 的建议，首先检查原图色域：

```sh
# 检查 JPG 色域
exiftool -ProfileDescription input.jpg
# 输出为 P3 色域
Profile Description : Display P3
# 输出为 sRGB 或不输出，为 sRGB 色域
Profile Description : sRGB IEC61966-2.1

# 检查 AVIF 色域
ffprobe -v error -show_streams -select_streams v:0 -print_format json input.avif
# pix_fmt，yuv420p 代表 YUV 4:2:0
# color_range，pc 代表全色阶
# color_primaries，smpte432 代表 P3，bt709 代表 sRGB
# color_transfer，iec61966-2-1 代表传输曲线为 sRGB
# color_space，对应 matrix，bt709 代表现代高清标准，一般被 P3 使用
{
    "pix_fmt": "yuv420p",
    "color_range": "pc",
    "color_primaries": "smpte432",
    "color_transfer": "iec61966-2-1",
    "color_space": "bt709",
}
```