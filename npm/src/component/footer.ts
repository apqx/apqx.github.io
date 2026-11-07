// import "./footer.scss"
import { isIndexPage } from "../base/constant"
import { getEventEmitter, type Events } from "./base/EventBus"
import { FadeAnimationController } from "./animation/FadeAnimationController"
import { AutoShowAnimationController } from "./animation/AutoShowAnimationController"
import type { IAutoShowAnimationController } from "./animation/IAutoShowAnimationController"

let footAnimationController: IAutoShowAnimationController 

function initFootAnimationController(autoShow: boolean) {
    const ele = document.querySelector("footer .fade") as HTMLElement | null
    if (footAnimationController == null && ele != null) {
        footAnimationController = new AutoShowAnimationController(new FadeAnimationController(ele), autoShow)
    }
}

let timeOutId: number | null = null

export function initFooter() {
    // footer 默认隐藏，监听进入视图时触发动画显示
    if (isIndexPage(document.location.pathname)) {
        // 索引页从空白加载数据，有单独处理，在内容加载后再设置渐进动画，避免闪烁
        // 监听 EventBus 事件
        initFootAnimationController(false)
        getEventEmitter().on("footerDisplayChange", (data: Events["footerDisplayChange"]) => {
            if (data.enabled) {
                if (timeOutId) {
                    clearTimeout(timeOutId)
                }
                setTimeout(() => {
                    footAnimationController.resetIntersectionObserve()
                }, 400)
            } else {
                footAnimationController.toggleOpen(false)
            }
        })
    } else {
        // 其它页面，Footer 设置渐进动画
        // 监听元素进入窗口初次显示
        initFootAnimationController(true)
    }
    document.querySelector("footer #link-material-design")?.addEventListener("click", () => {
        import("./dialog/MaterialDialog").then(module => {
            module.showMaterialDialog()
        })
    })
}

// index 业加载状态
// loading: true，隐藏 footer
// loading: false, show hint，显示 footer
// loading: false, no hint，显示 footer