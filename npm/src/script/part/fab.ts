import {MDCRipple} from "@material/ripple";
import {console_debug} from "../util/LogUtil";
import {showAlertDialog} from "../component/CommonAlertDialog";

/**
 * 初始化Floating Action Button，点击回到顶部
 */
export function initFab() {
    // 为fab添加ripple动画
    const fabE = document.querySelector(".mdc-fab")
    new MDCRipple(fabE)
    // topAppBar监听长按，把当前页编码后的URL复制到剪切板上
    fabE.addEventListener("long-press", () => {
        console_debug("long-press fab")
        showEncodedUrl()
    })
    fabE.addEventListener("click", () => {
        scrollToTop()
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