import "./scaffold.scss"
import { isWriting, runOnHtmlDone, runOnPageBackFromCache, runOnPageDone } from "../util/tools"
import { blockTopbarKeyFrameAnimation, initTopbar } from "../component/topbar"
import { initDrawer } from "../component/drawer"
import { checkUserTheme, initTheme } from "../component/theme"
import { initLocalRepository } from "../repository/LocalRepository"
import { initFont } from "../component/font/font"
import { initFab } from "../component/fab"
import { initTag, initTagTriggers } from "../component/tag"
import { initButton } from "../component/button"
import { initTable } from "../component/table"
import { initList } from "../component/list"
import { initText } from "../component/text"
import { consoleDebug } from "../util/log"
import { loadGoogleAnalytics } from "../util/gtag"
import { initFooter } from "../component/footer"
import { initCard } from "../component/card"
import { is404Page, isIndexPage, isPostPage } from "../base/constant"
import supportsWebP from "supports-webp"
import { showAlertDialog } from "../component/dialog/CommonAlertDialog"

initScaffold()

export function initScaffold() {
    runOnHtmlDone(() => {
        checkPage()
        initLocalRepository()
        initFont()
        initTopbar()
        initFooter()
        initTheme()
        initDrawer()
        initFab()
        initTag()
        initButton()
        initCard()
        initTable()
        initList()
        initText()
        initTagTriggers()
    })

    runOnPageDone(() => {
        checkWebpSupport()
        loadGoogleAnalytics()
    })

    runOnPageBackFromCache(() => {
        blockTopbarKeyFrameAnimation(true)
        checkUserTheme()
    })
}

// 检查当前页面类型，加载对应组件
function checkPage() {
    if (is404Page(window.location.pathname)) {
        import("./404").then((page) => {
            page.init404()
        }).catch((e) => {
            consoleDebug("Error loading 404 page script: " + e)
        })
    } else if (isIndexPage(window.location.pathname)) {
        import("./index").then((page) => {
            page.initIndex()
        }).catch((e) => {
            consoleDebug("Error loading index page script: " + e)
        })
    } else if (isPostPage(window.location.pathname)) {
        import("./post").then((page) => {
            page.initPost()
        }).catch((e) => {
            consoleDebug("Error loading post page script: " + e)
        })
    }
}


window.addEventListener("pageshow", (event) => {
    consoleDebug("Window event: pageshow, persisted = " + event.persisted)
    // Writing模式下为了方便刷新时文章审阅，不启用这里
    if (isWriting()) {
        consoleDebug("Writing mode, set scrollRestoration = auto")
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "auto";
        }
        return
    }
    if (event.persisted) {
        // 从其它页返回，浏览器会保留DOM和JS状态，以及滚动位置，设置scrollRestoration为默认值auto
        // 可以让浏览器恢复到离开时的位置，不需要做任何处理，除非JS、DOM丢失了，需要重新加载数据，再滚动到这个位置
        if ("scrollRestoration" in history) {
            consoleDebug("Page restore, set scrollRestoration = auto")
            history.scrollRestoration = "auto";
        }
    } else {
        // 并非从其它页返回，认为是页面刷新，不自动滚动到离开时的位置🤔
        // TODO:如何获取这个位置呢，或许可以平滑滚动到那里
        if ("scrollRestoration" in history) {
            consoleDebug("Page reload, set scrollRestoration = manual")
            history.scrollRestoration = "manual";
        }
    }
});

window.addEventListener("pagehide", (event) => {
    consoleDebug("Window event: pagehide")
});

function checkWebpSupport() {
    supportsWebP.then(supported => {
        if (!supported) {
            const urlLink = `
            当前浏览器不支持<a href="https://caniuse.com/?search=webp" target="_blank">WebP</a>格式，部分图片可能无法显示，请更新浏览器版本。
            `
            showAlertDialog("提示", urlLink, "关闭", () => {
                
            })
        } 
    })
}