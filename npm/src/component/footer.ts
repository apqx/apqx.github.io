// import "./footer.scss"
import { isIndexPage } from "../base/constant"
import { getWindowInterSectionObserver } from "./animation/BaseAnimation"
import { toggleElementClass } from "../util/tools"
import { consoleInfo } from "../util/log"
import { getEventEmitter, type Events } from "./base/EventBus"

var footerContentE: Element | null = null

function getFooterContentElement() {
    if (footerContentE == null) {
        footerContentE = document.querySelector("footer .fade-in")
    }
    return footerContentE
}

function showFooter(show: boolean = true) {
    consoleInfo("Show footer: " + show)
    const footerContentE = getFooterContentElement()
    if (footerContentE == null) return
    getWindowInterSectionObserver().unobserve(footerContentE as Element)
    if (show) {
        getWindowInterSectionObserver().observe(footerContentE as Element)
    } else {
        toggleElementClass(footerContentE, "fade-in--start", false)
    }
}

export function initFooter() {
    // footer 默认隐藏，监听进入视图时触发动画显示
    if (isIndexPage(document.location.pathname)) {
        // 索引页从空白加载数据，有单独处理，在内容加载后再设置渐进动画，避免闪烁
        // 监听 EventBus 事件
        getEventEmitter().on("footerDisplayChange", (data: Events["footerDisplayChange"]) => {
            showFooter(data.enabled)
        })
    } else {
        // 其它页面，Footer设置渐进动画
        // 监听元素进入窗口初次显示
        showFooter()
    }
}