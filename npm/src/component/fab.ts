import {MDCRipple} from "@material/ripple";
import {consoleDebug, consoleError} from "../util/log";
import {showAlertDialog} from "./dialog/CommonAlertDialog";
// import "./fab.scss"

export function initFab() {
    // 为fab添加ripple动画
    const fabE: HTMLElement = document.querySelector(".mdc-fab")
    new MDCRipple(fabE)
    // topAppBar监听长按，把当前页编码后的URL复制到剪切板上
    fabE.addEventListener("long-press", () => {
        consoleDebug("Long-press fab")
        showEncodedUrl()
    })
    fabE.addEventListener("click", () => {
        scrollToTop()
        // TODO: 在手机上，并不能消除焦点
        // fabE.blur()
        // window.location.replace("#top")
    })
}

function showEncodedUrl() {
    const url = window.location.href
    const urlLink = "当前页面的编码URL为<a href=\"" + url + "\">此链接</a>"
    showAlertDialog("提示", urlLink, "关闭", () => {
    })
}

function scrollToTop() {
    const c = window.scrollY
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, c - c / 8)
    }
}
