// import "./topbar.scss"
import { MDCIconButtonToggle } from "@material/icon-button"
import { consoleDebug, consoleError, consoleObjDebug } from "../util/log"
import { getLocalRepository } from "../repository/LocalDb"
import { MDCTopAppBar } from "@material/top-app-bar"
import { clearFocusListener, toggleClassWithEnable } from "../util/tools"
import { showAboutMeDialog } from "./dialog/AboutMeDialog"
import { getSectionTypeByPath, isIndexPage, SECTION_TYPE_LENS, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL, SECTION_TYPE_POETRY, SECTION_TYPE_PRINT, SECTION_TYPE_REPOST, SECTION_TYPE_SHARE, SECTION_TYPE_TAG } from "../base/constant"
import { toggleTheme } from "./theme"

var iconToggleTheme: MDCIconButtonToggle | null = null
export var topAppBar: MDCTopAppBar | null = null
export var topAppBarE: HTMLElement | null = null

export function refreshTopbar() {
    const fixedTopbar = getLocalRepository().getFixedTopbarOn()
    setFixedTopbar(fixedTopbar)
}

type ScrollChange = {
    scrollDown: boolean,
    scrollY: number
}

export function initTopbar() {
    const btnMenuE = document.querySelector("#topbar_btn_menu") as HTMLElement
    const btnThemeE = document.querySelector("#topbar_btn_theme") as HTMLElement
    const btnAboutMeE = document.querySelector("#topbar_btn_about_me") as HTMLElement
    topAppBarE = document.querySelector(".mdc-top-app-bar")
    if (topAppBarE == null) {
        consoleError("Topbar not found")
        return
    }
    initTitle(topAppBarE)

    topAppBar = new MDCTopAppBar(topAppBarE)
    iconToggleTheme = new MDCIconButtonToggle(btnThemeE)

    // 监听topbar的主题切换按钮
    btnThemeE?.addEventListener("click", () => {
        // toggleButton会自动toggle图标
        toggleTheme()
    });
    btnAboutMeE?.addEventListener("click", () => {
        showAboutMeDialog()
    })
    btnMenuE?.addEventListener("focus", clearFocusListener)
    btnThemeE?.addEventListener("focus", clearFocusListener)
    btnAboutMeE?.addEventListener("focus", clearFocusListener)

    refreshTopbar()
}


export function setFixedTopbar(on: boolean) {
    consoleDebug("setFixedTopbar " + on)
    // 监听滚动，平滑隐藏/显示
    // if (on) {
    //     toggleShowTopbar(true)
    //     window.removeEventListener("scroll", scrollListener)
    //     window.removeEventListener("animationend", animationDoneListener)
    //     toggleClassWithEnable(topAppBarE, "top-app-bar--moving-down", false)
    //     toggleClassWithEnable(topAppBarE, "top-app-bar--down", false)
    //     toggleClassWithEnable(topAppBarE, "top-app-bar--moving-up", false)
    //     toggleClassWithEnable(topAppBarE, "top-app-bar--up", false)
    // } else {
    //     // 非固定topbar监听滚动
    //     // 多次添加同一个监听器是无效的
    //     window.addEventListener("scroll", scrollListener)
    //     window.addEventListener("animationend", animationDoneListener)
    // }

    if (on) {
        toggleClassWithEnable(topAppBarE!!, "mdc-top-app-bar--no-sticky", false)
    } else {
        toggleClassWithEnable(topAppBarE!!, "mdc-top-app-bar--no-sticky", true)
    }
}

export function showToggleThemeIconDark(dark: boolean) {
    if (iconToggleTheme == null) return
    // 图标默认隐藏，避免切换页面时默认图标与主题不符引起的闪烁
    // 这样有时候仍会闪烁，但已经尽量避免了
    iconToggleTheme.on = dark
    toggleClassWithEnable(iconToggleTheme!!.root, "display-none", false)
}

export function toggleTopbarGlass(on: boolean) {
    toggleClassWithEnable(topAppBarE!!, "top-app-bar--blur", on)
}

const animationDoneListener = () => {
    consoleDebug("Topbar animation done")
    // topAppBarE.style.animationPlayState = "initial"
    if (topAppBarE!!.classList.contains("top-app-bar--moving-up")) {
        toggleClassWithEnable(topAppBarE!!, "top-app-bar--up", true)
        // toggleClassWithEnable(topAppBarE, "top-app-bar--moving-up", false)
    } else if (topAppBarE!!.classList.contains("top-app-bar--moving-down")) {
        toggleClassWithEnable(topAppBarE!!, "top-app-bar--down", true)
        // toggleClassWithEnable(topAppBarE, "top-app-bar--moving-down", false)
    }
}


// 忽略滚动的范围，此范围内不触发topbar状态变化
const topbarDisplayTriggerIgnoreScrollY = 200;
// 触发topbar状态变化的距离阈值
// TODO: 监测索引页的cover动画，卡片页的移动动画，阈值应大于它们
// 索引页cover最大300px，卡片页移动动画最大240px
let topbarDisplayTriggerScrollY = 100;

let lastScrollY = -1;
// 滚动变化的点
let lastScrollChange: ScrollChange | null = null;

const scrollListener = () => {
    // const bodyE = document.body
    // consoleDebug("Body scrollHeight = " + bodyE.scrollHeight + ", clientHeight = " + bodyE.clientHeight +
    //     ", scrollTop = " + window.scrollY
    // )
    // 顶部100px以内显示topbar
    // 之后向下滚动隐藏，向上滚动显示
    if (window.scrollY <= topbarDisplayTriggerIgnoreScrollY) {
        toggleShowTopbar(true);
        lastScrollY = -1;
        lastScrollChange = null;
        return;
    }
    if (lastScrollY == -1) {
        lastScrollY = window.scrollY;
        lastScrollChange = {
            scrollDown: true,
            scrollY: window.scrollY
        };
        return;
    }
    const scrollDown = window.scrollY > lastScrollY;
    if (scrollDown) {
        // 控制条向下滚动
        if (Math.abs(window.scrollY - lastScrollChange!!.scrollY) > topbarDisplayTriggerScrollY) {
            toggleShowTopbar(false);
            // 触发变化，记录变化的点
            lastScrollChange = {
                scrollDown: scrollDown,
                scrollY: window.scrollY
            };
        }
    } else {
        // 控制条向上滚动
        if (Math.abs(window.scrollY - lastScrollChange!!.scrollY) > topbarDisplayTriggerScrollY) {
            // toggleShowTopbar(true);
            // 触发变化，记录变化的点
            lastScrollChange = {
                scrollDown: scrollDown,
                scrollY: window.scrollY
            };
        }
    }
    lastScrollY = window.scrollY;
    if (lastScrollChange!!.scrollDown != scrollDown) {
        // 滚动方向变化，记录变化的点
        lastScrollChange = {
            scrollDown: scrollDown,
            scrollY: window.scrollY
        };
    }
}

function toggleShowTopbar(show: boolean) {
    // topbar默认不包含up-class和down-class
    if (show) {
        // 展示，向下移动
        if (!topAppBarE!!.classList.contains("top-app-bar--moving-down") && !topAppBarE!!.classList.contains("top-app-bar--down")) {
            if (!topAppBarE!!.classList.contains("top-app-bar--moving-up") && !topAppBarE!!.classList.contains("top-app-bar--up")) {
                // topbar处于默认的显示状态，不必启动动画
                return
            }
            consoleDebug("ToggleShowTopbar " + show)
            blockTopbarKeyFrameAnimation(false)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--moving-down", true)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--moving-up", false)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--up", false)
        }
    } else {
        // 隐藏，向上移动
        if (!topAppBarE!!.classList.contains("top-app-bar--up") && !topAppBarE!!.classList.contains("top-app-bar--moving-up")) {
            consoleDebug("ToggleShowTopbar " + show)
            blockTopbarKeyFrameAnimation(false)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--moving-up", true)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--moving-down", false)
            toggleClassWithEnable(topAppBarE!!, "top-app-bar--down", false)
        }
    }
}

export function blockTopbarKeyFrameAnimation(block: boolean) {
    if (block) {
        topAppBarE!!.style.animation = "none"
        // topAppBarE.style.animationPlayState = "paused"
    } else {
        topAppBarE!!.style.animation = "";
        // topAppBarE.style.animationPlayState = "running"
    }
}

function initTitle(topAppBarE: HTMLElement) {
    const path = window.location.pathname
    const section = getSectionTypeByPath(path)
    const isIndex = isIndexPage(path)
    let titleAE: HTMLLinkElement = topAppBarE.querySelector(".mdc-top-app-bar__title a") as HTMLLinkElement
    switch (section.identifier) {
        case SECTION_TYPE_ORIGINAL.identifier: {
            titleAE.parentElement?.classList.add("title-home")
            titleAE.innerText = "ʕ•ᴥ•ʔ"
            titleAE.href = "/"
            break
        }
        case SECTION_TYPE_REPOST.identifier: {
            titleAE.innerText = "Repost"
            titleAE.href = isIndex ? "/" : section.indexPath
            break
        }
        case SECTION_TYPE_POETRY.identifier: {
            titleAE.innerText = "Poetry"
            titleAE.href = isIndex ? "/" : section.indexPath
            break
        }
        case SECTION_TYPE_OPERA.identifier: {
            titleAE.innerText = "Opera"
            titleAE.href = isIndex ? "/" : section.indexPath
            break
        }
        case SECTION_TYPE_LENS.identifier: {
            titleAE.innerText = "Lens"
            titleAE.href = isIndex ? "/" : section.indexPath
            break
        }
        case SECTION_TYPE_TAG.identifier: {
            titleAE.innerText = "Tags"
            titleAE.href = "/"
            break
        }
        case SECTION_TYPE_SHARE.identifier: {
            titleAE.innerText = "Share"
            titleAE.href = "/"
            break
        }
        case SECTION_TYPE_PRINT.identifier: {
            titleAE.innerText = "Print"
            titleAE.href = "/"
            break
        }
        default: {
            titleAE.innerText = "Other"
            titleAE.href = "/"
            break
        }
    }
}