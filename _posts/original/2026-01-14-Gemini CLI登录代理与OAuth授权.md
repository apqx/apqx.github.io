---
layout: post
categories: original
title: "Gemini CLI 登录代理与 OAuth 授权"
author: 立泉
mention: Clash Proxy OAuth2 Terminal 环境变量
date: 2026-01-14 +0800
description: 订阅后安装 Gemini CLI 终端工具，开启系统代理却始终无法登录，终端启动的浏览器授权页正常打开但似乎不能将授权结果传递回来，问题根源在于 Terminal 不会自动应用系统代理设置。
cover: 
tags: Code AI Gemini Proxy OAuth2 环境变量
published: true
---

2026 年初 Claude Code、Gemini CLI 和 GitHub Copilot 在快速进化的终端 Agent 领域已成三足鼎立，之前使用 Copilot 时对这类 AI 智能体的意图理解和复杂工程编码能力印象深刻。虽然在 Copilot 中可以使用 Claude、Codex 和 Gemini Pro 的最新版本，但 Pro 订阅每月 300 次高级请求在高强度使用下快速消耗有时感到捉襟见肘，便准备尝试另外两家的 CLI 工具。

以“慷慨”闻名的 Google AI Pro 提供前 3 个月低价试用，所以先从 Gemini 开始。

## 登录问题

订阅后安装 Gemini CLI 终端工具，开启系统代理却始终无法登录，终端启动的浏览器授权页正常打开但似乎不能将授权结果传递回来。

Gemini 对这个问题的回答是检查系统代理设置是否拦截了浏览器发往本地回环地址 127.0.0.1 的流量，将其强行送入 VPN 隧道导致 CLI 进程无法接收到授权 token。但是我看到 Proxy 设置中已经将它们设为 Bypass 绕过：

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20260114/settings_proxy.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Proxy settings in macOS" }

而且相同授权流程 Android Studio 的 Gemini Code Assistant 可以正常登录，所以不是系统代理问题。

老办法 Google 搜索发现这个问题相当常见，在 [gemini-cli issue](https://github.com/google-gemini/gemini-cli/issues/2081){: target="_blank"} 中找到了问题原因，是 Terminal 不会自动应用系统代理设置，导致 CLI 进程无法连接到 Google，需要手动设置 proxy 环境变量。

之前没有留意过 Terminal 不会自动应用系统代理，偶尔几次 Homebrew 下载缓慢时切换代理没有改善我一直以为是高峰期代理网络拥堵...尝试添加环境变量后问题解决：

```sh
# 在 Terminal 中临时设置 proxy 环境变量，之后每次使用 gemini 命令都需要先设置此环境变量
# 需确认实际代理类型和端口
export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897
```

将问题原因转给 Gemini 获得了一段在 Terminal 中开关代理的脚本，将其添加到`~/.zshrc`后即可按需执行`proxy_on`或`proxy_off`：

```sh
# macOS 和 Linux 脚本
PROXY_HTTP="http://127.0.0.1:7897"
PROXY_SOCKS="socks5://127.0.0.1:7897"

function proxy_on() {
    export http_proxy=$PROXY_HTTP
    export https_proxy=$PROXY_HTTP
    export all_proxy=$PROXY_SOCKS
    echo "✅ Terminal 代理已开启"
    echo "HTTP/HTTPS: $PROXY_HTTP"
    echo "ALL_PROXY:  $PROXY_SOCKS"
    # 验证当前外网 IP
    curl -L ip.gs
}

function proxy_off() {
    unset http_proxy
    unset https_proxy
    unset all_proxy
    echo "❌ Terminal 代理已关闭"
    # 验证恢复后的 IP
    curl -L ip.gs
}

# Windows PowerShell 脚本
$proxyHttp = "http://127.0.0.1:7897"
$proxySocks = "socks5://127.0.0.1:7897"

function proxy_on {
    $env:http_proxy = $proxyHttp
    $env:https_proxy = $proxyHttp
    $env:all_proxy = $proxySocks
    Write-Host "------------------------------------" -ForegroundColor Cyan
    Write-Host "✅ Terminal 代理已开启" -ForegroundColor Green
    Write-Host "HTTP/HTTPS : $proxyHttp"
    Write-Host "SOCKS/ALL  : $proxySocks"
    Write-Host "------------------------------------" -ForegroundColor Cyan
    # 验证当前 IP
    curl.exe -L ip.gs
}

function proxy_off {
    $env:http_proxy = $null
    $env:https_proxy = $null
    $env:all_proxy = $null
    Write-Host "------------------------------------" -ForegroundColor Cyan
    Write-Host "❌ Terminal 代理已关闭" -ForegroundColor Red
    Write-Host "------------------------------------" -ForegroundColor Cyan
    # 验证恢复后的 IP
    curl.exe -L ip.gs
}
```

每次在 Terminal 中启动 Gemini CLI 之前先启动代理：

```sh
➜ ~ proxy_on 
✅ Terminal 代理已开启
HTTP/HTTPS: http://127.0.0.1:7897
ALL_PROXY:  socks5://127.0.0.1:7897
217.**6.**4.**1
➜ ~ gemini

  ▝▜▄     Gemini CLI v0.33.1
    ▝▜▄
   ▗▟▀    Logged in with Google /auth
  ▝▀      Gemini Code Assist in Google One AI Pro /upgrade

──────────────────────────────────────────────────────────
 shift+tab to accept edits
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 >   Type your message or @path/to/file                   
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
```

## OAuth 机制

若从 Gemini CLI 使用的 OAuth2 授权机制来看，其实可以清晰发现症结所在。

在这一机制中，CLI 并不直接要求在终端输入账号密码，而是通过浏览器打开一个 Google 账号授权页面，同时本地启动一个 Web Server 服务等待浏览器传回授权结果，通常是一个授权码。用户在浏览器授权页完成授权时触发重定向到 localhost 对应端口，CLI Server 获得授权码后向 Google 服务器换取代表用户身份的`access_token`，完成登录。

通过`lsof -nP -iTCP | grep LISTEN`可查看本地启动的 Web Server：

```sh
# Gemini CLI 基于 Node 实现，每次授权的端口号都会变化
Adobe\x20  770 apqx   23u  IPv4 0xda7d984a3b098c6e      0t0  TCP 127.0.0.1:15393 (LISTEN)
ruby      6868 apqx    7u  IPv4 0xcbc26c0e04f2720a      0t0  TCP *:4000 (LISTEN)
node      9797 apqx   10u  IPv4 0xd2d51a691221d9a3      0t0  TCP *:35729 (LISTEN)
```

问题出在 CLI 通过授权码连接 Google 换取`access_token`这一步，必须配置好代理，否则不可能成功。

解决后回头看 Gemini 在我第一次提问时的回答，其中第 3 项就与 Terminal 代理的环境变量有关，只不过说反了🤔。

![](https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/original/20260114/gemini_chat_solution.webp){: loading="lazy" class="clickable clickShowOriginalImg" alt="Gemini's solution about terminal proxy" }