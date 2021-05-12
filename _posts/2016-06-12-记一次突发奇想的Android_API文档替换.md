---
layout: post
type: essy
title:  "记一次突发奇想的Android API文档替换"
author: 立泉
date:   2016-06-12 +0800
description: 
cover: 
categories: essy
tags: CS Android Java
---

在学习`Android`的过程中，自然要使用`Android`系统提供的应用开发接口，即要参阅`Android API`文档来选择需要的接口以调用相应的功能。实际上在`Android SDK`的本地文件夹中就有一份`HTML`版本的`API`文档，可以使用浏览器离线查看，但是当我用浏览器打开这些文档的时候，却发现在联网状态下加载速度极慢，而当断开网络的时候加载速度就正常了。考虑到墙的存在，猜测应该是`HTML`文档中存在需要联网下载的`StyleSheet`或`Javascript`，而要连接的域名十有八九就是`Google`。

排查了一会，加载缓慢的元凶就是下面这两段代码：

```xml
<script src="http://www.google.com/jsapi" type="text/javascript"></script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-5831155-1', 'android.com');
  ga('create', 'UA-49880327-2', 'android.com', {'name': 'universal'});  // New tracker);
  ga('send', 'pageview');
  ga('universal.send', 'pageview'); // Send page view for new tracker.
</script>
```

“正常”情况下无法访问的远程资源，浏览器等待服务器响应直至超时，造成了加载缓慢的现象，所以，删除这部分代码即可使浏览器正常加载这些文件，而且不会对文档内容造成影响，只是缺少了某些交互效果，它们在大部分情况下并不重要，我们需要的是`API`内容。当然还有一种完美的解决方法，`科学上网`，但是，这种方法在某种程度上说，并不方便。

我写了下面的一个小程序来处理这几千个HTML文件，即扫描所有文件，一旦发现含有以上代码即删除，然后重新输出回原文件。逐一读写数千个文档是一个相当费时的操作，所幸我并不赶时间。

```java
package apqx.me.util;

import java.awt.*;
import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by apqx on 2016/6/11.
 * 删除Android API文档中需要链接Google的两段Javascript代码
 */
public class ChangeFile {
    public static void main(String[] args) {
        ChangeFile changeFile = new ChangeFile();
        // 文档所在的文件夹
        File file = new File("F:/docs");
        changeFile.scanFile(file);
        try {
            Desktop.getDesktop().open(new File(file, "index.html"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void scanFile(File file) {
        if (file.isDirectory()){
            File[] list = file.listFiles(new FileFilter() {
                @Override
                public boolean accept(File file) {
                    if (file.isDirectory()){
                        return true;
                    } else if (file.getName().contains("html")){
                        return true;
                    } else {
                        return false;
                    }
                }
            });
            for (File f:list){
                scanFile(f);
            }
        } else {
            changeContent(file);
        }
    }
    
    private void changeContent(File file){
        BufferedReader bufferedReader = null;
        BufferedWriter bufferedWriter = null;
        try {
            bufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(file)));
            StringBuilder stringBuilder = new StringBuilder();
            String string;
            while ((string = bufferedReader.readLine()) != null){
                stringBuilder.append(string + "\n");
            }
            string = stringBuilder.toString();
            Matcher matcher = Pattern.compile("(<script .*http.*></script>)|((?s)<script>\n.*tracker\\.\n</script>)").matcher(string);
            while (matcher.find()) {
                string = matcher.replaceAll("");
            }
            bufferedWriter = new BufferedWriter(new FileWriter(file));
            bufferedWriter.write(string);
            System.out.println("已处理\n"+file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                bufferedReader.close();
                bufferedWriter.close();
            } catch (Exception e){
                e.printStackTrace();
            }
        }
    }
}
```