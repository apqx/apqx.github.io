import "./scaffold.scss"
import { isWriting, runOnHtmlDone, runOnPageBackFromCache, runOnPageDone } from "../util/tools"
import { initTheme } from "../component/theme"
import { initLocalRepository } from "../repository/LocalDb"
import { initFont } from "../component/font/font"
import { initFab } from "../component/fab"
import { initTag, initTagTriggers } from "../component/tag"
import { initText } from "../component/text"
import { consoleInfo } from "../util/log"
import { loadGoogleAnalytics } from "../util/gtag"
import { initFooter } from "../component/footer"
import { initCard } from "../component/card"
import { is404Page, isIndexPage, isPostPage } from "../base/constant"
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter } from "../component/base/EventBus"
import { initHeader } from "../component/react/Topbar"
import { initTable } from "../component/table"

initScaffold()

export function initScaffold() {
    runOnHtmlDone(() => {
        checkPage()
        initLocalRepository()
        initFont()
        initHeader()
        initFooter()
        initTheme()
        initTable()
        initFab()
        initTag()
        initCard()
        initText()
        initTagTriggers()
        // 检查 URL 中的测试参数
        checkTest()
    })

    runOnPageDone(() => {
        loadGoogleAnalytics()
    })

    runOnPageBackFromCache(() => {
        // blockTopbarKeyFrameAnimation(true)
        // 检查框架的主题、字体等配置变化，通知对应组件刷新
        // 发出一个事件，通知其它组件页面已从缓存中加载，应该刷新数据
        getEventEmitter().emit("pageEvent", EVENT_PAGE_BACK_FROM_CACHE)
    })
}

// 检查当前页面类型，加载对应组件
function checkPage() {
    if (is404Page(window.location.pathname)) {
        import("./404").then((page) => {
            page.init404()
        }).catch((e) => {
            consoleInfo("Error loading 404 page script: " + e)
        })
    } else if (isIndexPage(window.location.pathname)) {
        import("./index").then((page) => {
            page.initIndex()
        }).catch((e) => {
            consoleInfo("Error loading index page script: " + e)
        })
    } else if (isPostPage(window.location.pathname)) {
        import("./post").then((page) => {
            page.initPost()
        }).catch((e) => {
            consoleInfo("Error loading post page script: " + e)
        })
    }
}


window.addEventListener("pageshow", (event) => {
    consoleInfo("Window event: pageshow, persisted = " + event.persisted)
    // Writing 模式下为方便刷新时文章审阅，自动滚动到上次的位置
    if (isWriting()) {
        consoleInfo("Writing mode, set scrollRestoration = auto")
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "auto";
        }
        return
    }
    if (event.persisted) {
        // 从其它页返回，浏览器会保留 DOM 和 JS 状态，以及滚动位置，设置 scrollRestoration 为默认值 auto
        // 可以让浏览器恢复到离开时的位置，不需要做任何处理，除非 JS、DOM 丢失了，需要重新加载数据，再滚动到这个位置
        if ("scrollRestoration" in history) {
            consoleInfo("Page restore, set scrollRestoration = auto")
            history.scrollRestoration = "auto";
        }
    } else {
        // 并非从其它页返回，认为是页面刷新，不自动滚动到离开时的位置🤔
        // TODO: 如何获取这个位置呢，或许可以平滑滚动到那里
        if ("scrollRestoration" in history) {
            consoleInfo("Page reload, set scrollRestoration = manual")
            history.scrollRestoration = "manual";
        }
    }
});

window.addEventListener("pagehide", (_event) => {
    consoleInfo("Window event: pagehide")
});

/**
 * 检查 url 是否包含测试参数，启用对应功能
 */
function checkTest() {
    // 如果url含有 ?fontSans=true, 启用思源黑体
    const urlParams = new URLSearchParams(window.location.search)
    const _fontSans = urlParams.get("fontSans")

}
