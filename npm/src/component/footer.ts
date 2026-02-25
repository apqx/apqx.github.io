// import "./footer.scss"
import { isIndexPage } from "../base/constant"
import { getInterSectionObserver } from "./animation/BaseAnimation"

/**
 * 在 Index 页面 Footer 默认隐藏，首次加载完成后显示出来
 */
export function showFooter() {
    const footerContentE = document.querySelector("footer .card-fade-in")
    getInterSectionObserver().observe(footerContentE!!)
}

export function initFooter() {
    // footer 默认隐藏，监听进入视图时触发动画显示
    if (isIndexPage(document.location.pathname)) {
        // 索引页从空白加载数据，有单独处理，在内容加载后再设置渐进动画，避免闪烁
    } else {
        // 其它页面，Footer设置渐进动画
        // 监听元素进入窗口初次显示
        showFooter()
    }
}