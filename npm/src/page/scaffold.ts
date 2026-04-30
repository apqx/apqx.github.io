import "./scaffold.scss"
import { isChrome, isWriting, runOnHtmlDone, runOnPageBackFromCache, runOnPageDone, toggleElementClass } from "../util/tools"
import { initTopbar } from "../component/topbar"
import { initDrawer } from "../component/drawer"
import { initTheme } from "../component/theme"
import { getLocalRepository, initLocalRepository } from "../repository/LocalDb"
import { initFont } from "../component/font/font"
import { initFab } from "../component/fab"
import { initTag, initTagTriggers } from "../component/tag"
import { initButton } from "../component/button"
import { initTable } from "../component/table"
import { initList } from "../component/list"
import { initText } from "../component/text"
import { consoleError, consoleInfo } from "../util/log"
import { loadGoogleAnalytics } from "../util/gtag"
import { initFooter } from "../component/footer"
import { initCard } from "../component/card"
import { is404Page, isIndexPage, isPostPage } from "../base/constant"
import supportsWebP from "supports-webp"
import { showSimpleAlertDialog } from "../component/dialog/CommonAlertDialog"
import { ResizeWidthObserver } from "../base/ResizeWidthObserver"
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter, type Events } from "../component/base/EventBus"
import { initScrim } from "../component/scrim"

initScaffold()

export function initScaffold() {
    runOnHtmlDone(() => {
        // checkBrowser()
        checkPage()
        initLocalRepository()
        initFont()
        initTopbar()
        initStatusBarProtector()
        initFooter()
        initTheme()
        initDrawer()
        initScrim()
        initFab()
        initTag()
        initButton()
        initCard()
        initTable()
        initList()
        initText()
        initTagTriggers()
        // 检查 URL 中的测试参数
        checkTest()
    })

    runOnPageDone(() => {
        checkWebpSupport()
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

window.addEventListener("pagehide", (event) => {
    consoleInfo("Window event: pagehide")
});

function checkWebpSupport() {
    supportsWebP.then(supported => {
        if (!supported) {
            const urlLink = `
            当前浏览器不支持 <a href="https://caniuse.com/?search=webp" target="_blank">WebP</a> 格式，部分图片可能无法显示，请更新浏览器版本。
            `
            showSimpleAlertDialog("提示", urlLink, "关闭", () => {

            })
        }
    })
}

var statusBarProtectorE: HTMLElement | null = null

// TODO: statusBarProtectorE 本来应该只获取一次，但在一种情况下会从对象变为 null，比如初始隐藏，init 时能获取到 element 对象
// 但在设置中修改状态后原来有值的变量就变成 null 了，原因不明，暂时先每次都获取一次，后续有时间再调查
function getStatusBarProtectorE() {
    if (statusBarProtectorE == null) {
        statusBarProtectorE = document.querySelector(".status-bar-protector") as HTMLElement
    }
    return statusBarProtectorE
}

function initStatusBarProtector() {
    checkStatusBarProtector()

    getEventEmitter().on("hideStatusBarBgChange", (data: Events["hideStatusBarBgChange"]) => {
        consoleInfo("Scaffold receive hideStatusBarBgChange event, enabled = " + data.enabled)
        checkStatusBarProtector()
    })
    getEventEmitter().on("pageEvent", (data: Events["pageEvent"]) => {
        consoleInfo("Scaffold receive pageEvent, event = " + data)
        if (data == EVENT_PAGE_BACK_FROM_CACHE) {
            checkStatusBarProtector()
        }
    })
}

function checkStatusBarProtector() {
    const statusBarProtectorE = getStatusBarProtectorE()
    consoleInfo("Check status bar protector, statusBarProtectorE = " + statusBarProtectorE)
    if (statusBarProtectorE == null) return
    const localShow = !getLocalRepository().getHideStatusBarBg()
    consoleInfo("Check status bar protector, localShow = " + localShow)
    toggleElementClass(statusBarProtectorE, "status-bar-protector--show", localShow)
}

/**
 * 检查 url 是否包含测试参数，启用对应功能
 */
function checkTest() {
    // 如果url含有 ?fontSans=true, 启用思源黑体
    const urlParams = new URLSearchParams(window.location.search)
    const fontSans = urlParams.get("fontSans")

}

function checkBrowser() {
    // 解决移动端Chrome字体问题，在小米手机上可能字体过大，原因是窗口宽度过小，所以为小宽度设置一个合适的字体大小
    if (isChrome()) {
        const updateChromeClass = (width: number) => {
            consoleInfo("Chrome detected, window width: " + width)
            if (width < 400) {
                consoleInfo("Chrome windowWidth < 400px, set fontSize to 14.5px")
                document.documentElement.style.fontSize = "14.5px"
            } else if (width >= 400 && width < 410) {
                consoleInfo("Chrome windowWidth >= 400px, < 410px, set fontSize to 15px")
                document.documentElement.style.fontSize = "15px"
            } else {
                consoleInfo("Chrome windowWidth >= 410px, set fontSize to unset")
                document.documentElement.style.fontSize = "unset"
            }
        }
        updateChromeClass(window.innerWidth)
        new ResizeWidthObserver(document.documentElement, (width) => {
            updateChromeClass(width)
        })
    }
    // alert("width = " + window.innerWidth)
}
