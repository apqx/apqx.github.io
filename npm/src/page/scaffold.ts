// import "./scaffold.scss"
import { checkWebpSupport, isDebug, isWriting, runOnHtmlDone, runOnPageBackFromCache, runOnPageDone } from "../util/tools"
import { blockTopbarKeyFrameAnimation, initTopbar } from "../component/topbar"
import { initDrawer } from "../component/drawer"
import { checkUserTheme, initTheme } from "../component/theme"
import { initLocalRepository } from "../repository/LocalRepository"
import { initFont } from "../component/font/font"
import { initFab } from "../component/fab"
import { initTag, initTagTriggers } from "../component/tag"
import { initButton } from "../component/button"
import { initTable } from "../component/table";
import { initList } from "../component/list";
import { initText } from "../component/text";
import { consoleDebug, consoleObjDebug } from "../util/log";
import { loadGoogleAnalytics } from "../util/gtag";

runOnHtmlDone(() => {
    initLocalRepository()
    initFont()
    initTopbar()
    initTheme()
    initDrawer()
    initFab()
    // TODO:可选项，懒加载
    initTag()
    initButton()
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