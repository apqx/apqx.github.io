# 树莓派遇上Java_02-准备篇

## APQX

## 2016年9月11日

### 安装系统

树莓派支持很多系统，这里以Raspbian为例，介绍其安装过程。首先，应准备一张至少8G的MicroSD卡作为系统盘，到树莓派官网下载[Raspbian](https://www.raspberrypi.org/downloads/raspbian/)。

参照[官方安装指导](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)，
安装过程即使用 [Etcher](https://etcher.io/)将下载好的Raspbian镜像文件写入SD卡，再将SD卡插入树莓派，通电即可开机。

### 系统设置及安装软件

由于我身边没有可用的显示器，所以我全程都是使用SSH来连接树莓派。从路由器上接出一根网线连接树莓派的以太网口，会通过DHCP自动为树莓派分配IP地址，登陆路由器即可获得树莓派的IP，如果在有些情况下无法登陆路由器的话，还可以使用[Advanced IP Scanner](https://www.advanced-ip-scanner.com/)来扫描局域网内的所有设备，也可以得到树莓派的IP。

获得树莓派IP后可使用[Xshell](https://www.netsarang.com/products/xsh_overview.html)建立SSH连接，如果是Linux用户，直接执行`ssh ip@username`即可，可以使用[FileZilla](https://filezilla-project.org/)传输文件，树莓派默认的连接账号是：

```
username：pi
password：raspberry
```

接下来设置超级用户密码

```
sudo passwd root
```

在root用户下进入高级设置，扩展存储卡空间

```
sudo raspi-config
```

安装tightvncserve远程桌面服务，新版本的Raspbian已经集成了vnc远程桌面，这里也可以手动安装

```
sudo apt-get install tightvncserver
```

设置密码

```
vnapasswd
```

启用远程桌面服务，这样就可以在Windows或其它平台通过VNC Viewer来操作树莓派

```
vncserver :1 -geometry 800x600
```

PC端通过[VNC Viewer](https://www.realvnc.com/en/connect/download/viewer/)即可登录远程桌面。

```
vncServer:Your IP:1
password:Your Password
```

安装文泉驿的开源中文字体

```
sudo apt-get install ttf-wqy-zenhei
```

让树莓派建立WIFI热点，使连接不再依赖路由器，参考以下文章 

[参考01](http://blog.csdn.net/xukai871105/article/details/42497097)  
[参考02](http://elinux.org/RPI-Wireless-Hotspot)

### 安装wiringPi和pi4j

如果要使用Java操作GPIO的话，需要安装[pi4j](http://pi4j.com/)，由于pi4j API是基于wiringPi库的，所以要先安装wiringPi。 

下载[wiringPi](https://git.drogon.net/?p=wiringPi;a=summary)

安装

```
//文件名可能有所不同
tar -xfz wiringPi-98bcb20.tar.gz 
cd wiringPi-98bcb20
./build
```

验证wiringPi是否安装成功

```
gpio -v
```

下载[pi4j](http://pi4j.com/download.html)

安装

```
//文件名可能有所不同
sudo dpkg -i pi4j-1.1.deb
```

### 使用pi4j

编译

```
pi4j -c Demo.java
```

运行

```
pi4j Demo
```

运行jar包

```
pi4j -jar Demo.jar
```