// import "./footer.scss"
import { isIndexPage } from "../base/constant"
import { interSectionObserver } from "./animation/BaseAnimation"

/**
 * 在Index页面Footer默认隐藏，首次加载完成后显示出来
 */
export function showFooter() {
    const footerE = document.querySelector("footer")
    interSectionObserver.observe(footerE!!)
}

export function initFooter() {
    if (isIndexPage(document.location.pathname)) {
        // 索引页有单独处理，在内容加载后再设置渐进动画

        // 标签索引页单独处理
        if (document.location.pathname.includes("/section/tag")) {
            showFooter()
        }
    } else {
        // 其它页面，Footer设置渐进动画
        // 监听元素进入窗口初次显示
        showFooter()
    }
}