// import "./fab.scss"
import { MDCRipple } from "@material/ripple"
import { consoleDebug, consoleError } from "../util/log"
import { showAlertDialog } from "./dialog/CommonAlertDialog"

export function initFab() {
    // 为fab添加ripple动画
    const fabE: HTMLElement | null = document.querySelector(".mdc-fab")
    // new MDCRipple(fabE)
    // topAppBar监听长按，把当前页编码后的URL复制到剪切板上
    fabE?.addEventListener("long-press", () => {
        consoleDebug("Long-press fab")
        showEncodedUrl()
    })
    fabE?.addEventListener("click", () => {
        scrollToTop()
        // window.location.replace("#top")
    })
    // 在触控模式下无法让fab自动失去焦点
    // fabE.addEventListener("hover", () => {
    //     fabE.blur()
    // })
}

function showEncodedUrl() {
    const url = window.location.href
    const urlLink = `
    <span>当前页面的编码URL为：<span><br/>
    <span style="color: var(--mdc-theme-on-surface-secondary); margin: 0; padding: 0.5rem 0; line-break: anywhere">${url}</span>
    `
    showAlertDialog("提示", urlLink, "关闭", () => {
    })
    // navigator.clipboard.writeText(url).then(() => {
    //     consoleDebug("Copy url to clipboard: " + url)
    //     alert("编码URL已复制到剪切板")
    // }).catch(err => {
    //     consoleError("Copy url to clipboard failed: " + err)
    //     alert("编码URL复制到剪切失败： " + err)
    // })
}

let lastScrollY = -1

function scrollToTop() {
    const scrollY = window.scrollY
    if (lastScrollY != -1 && scrollY > lastScrollY) {
        // 用户中断
        lastScrollY = -1
        return
    }
    if (scrollY > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, scrollY - scrollY / 15)
    }
    lastScrollY = scrollY
    if (lastScrollY <= 0) lastScrollY = -1
}
