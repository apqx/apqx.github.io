import { MDCIconButtonToggle } from "@material/icon-button";
import { consoleDebug, consoleError } from "../util/log";
import { toggleMetaThemeColor, toggleTheme } from "./theme";
import { localRepository } from "../repository/LocalRepository";
import { MDCTopAppBar } from "@material/top-app-bar";
import { clearFocusListener, isMobileOrTablet, toggleClassWithEnable } from "../util/tools";
import { showAboutMeDialog } from "./dialog/AboutMeDialog";
// import "./topbar.scss"

export var iconToggleTheme: MDCIconButtonToggle = null
export var topAppBar: MDCTopAppBar = null
export var topAppBarE: HTMLElement = null

export function refreshTopbar() {
    const fixedTopbar = localRepository.getFixedTopbarOn()
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

    topAppBar = new MDCTopAppBar(topAppBarE)
    iconToggleTheme = new MDCIconButtonToggle(btnThemeE)

    // 监听topbar的主题切换按钮
    btnThemeE.addEventListener("click", () => {
        // toggleButton会自动toggle图标
        toggleTheme(true)
    });
    btnAboutMeE.addEventListener("click", () => {
        showAboutMeDialog()

    })
    btnMenuE.addEventListener("focus", clearFocusListener)
    btnThemeE.addEventListener("focus", clearFocusListener)
    btnAboutMeE.addEventListener("focus", clearFocusListener)

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
        toggleClassWithEnable(topAppBarE, "mdc-top-app-bar--no-sticky", false)
    } else {
        toggleClassWithEnable(topAppBarE, "mdc-top-app-bar--no-sticky", true)
    }
}

export function toggleTopbarGlass(on: boolean) {
    toggleClassWithEnable(topAppBarE, "top-app-bar--blur", on)
}

const animationDoneListener = () => {
    consoleDebug("Topbar animation done")
    // topAppBarE.style.animationPlayState = "initial"
    if (topAppBarE.classList.contains("top-app-bar--moving-up")) {
        toggleClassWithEnable(topAppBarE, "top-app-bar--up", true)
        // toggleClassWithEnable(topAppBarE, "top-app-bar--moving-up", false)
    } else if (topAppBarE.classList.contains("top-app-bar--moving-down")) {
        toggleClassWithEnable(topAppBarE, "top-app-bar--down", true)
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
let lastScrollChange: ScrollChange = null;

const scrollListener = () => {
    // const bodyE = document.querySelector("body")
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
        if (Math.abs(window.scrollY - lastScrollChange.scrollY) > topbarDisplayTriggerScrollY) {
            toggleShowTopbar(false);
            // 触发变化，记录变化的点
            lastScrollChange = {
                scrollDown: scrollDown,
                scrollY: window.scrollY
            };
        }
    } else {
        // 控制条向上滚动
        if (Math.abs(window.scrollY - lastScrollChange.scrollY) > topbarDisplayTriggerScrollY) {
            // toggleShowTopbar(true);
            // 触发变化，记录变化的点
            lastScrollChange = {
                scrollDown: scrollDown,
                scrollY: window.scrollY
            };
        }
    }
    lastScrollY = window.scrollY;
    if (lastScrollChange.scrollDown != scrollDown) {
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
        if (!topAppBarE.classList.contains("top-app-bar--moving-down") && !topAppBarE.classList.contains("top-app-bar--down")) {
            if (!topAppBarE.classList.contains("top-app-bar--moving-up") && !topAppBarE.classList.contains("top-app-bar--up")) {
                // topbar处于默认的显示状态，不必启动动画
                return
            }
            consoleDebug("ToggleShowTopbar " + show)
            blockTopbarKeyFrameAnimation(false)
            toggleClassWithEnable(topAppBarE, "top-app-bar--moving-down", true)
            toggleClassWithEnable(topAppBarE, "top-app-bar--moving-up", false)
            toggleClassWithEnable(topAppBarE, "top-app-bar--up", false)
        }
    } else {
        // 隐藏，向上移动
        if (!topAppBarE.classList.contains("top-app-bar--up") && !topAppBarE.classList.contains("top-app-bar--moving-up")) {
            consoleDebug("ToggleShowTopbar " + show)
            blockTopbarKeyFrameAnimation(false)
            toggleClassWithEnable(topAppBarE, "top-app-bar--moving-up", true)
            toggleClassWithEnable(topAppBarE, "top-app-bar--moving-down", false)
            toggleClassWithEnable(topAppBarE, "top-app-bar--down", false)
        }
    }
}

export function blockTopbarKeyFrameAnimation(block: boolean) {
    if (block) {
        topAppBarE.style.animation = "none"
        // topAppBarE.style.animationPlayState = "paused"
    } else {
        topAppBarE.style.animation = null;
        // topAppBarE.style.animationPlayState = "running"
    }
}
