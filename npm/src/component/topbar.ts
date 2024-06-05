import { MDCIconButtonToggle } from "@material/icon-button";
import { consoleDebug, consoleError } from "../util/log";
import { toggleTheme } from "./theme";
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
    if (on) {
        toggleShowTopbar(true)
        window.removeEventListener("scroll", scrollListener)
    } else {
        // 非固定topbar监听滚动
        // 多次添加同一个监听器是无效的
        window.addEventListener("scroll", scrollListener)
    }
    // 只有桌面浏览器才设置毛玻璃，和theme-color的判断条件一致，毛玻璃和theme-color难以搭配，索性不搭
    if (isMobileOrTablet()) {
        // 移动设备会设置theme-color，不启用毛玻璃
    } else {
        // 桌面设备不设置theme-color，启用毛玻璃
        toggleClassWithEnable(topAppBarE, "top-app-bar--blur", on)
    }
}


// 忽略滚动的范围，此范围内不触发topbar状态变化
const topbarDisplayTriggerIgnoreScrollY = 500;
// 触发topbar状态变化的距离阈值
// TODO: 监测索引页的cover动画，卡片页的移动动画，阈值应大于它们
// 索引页cover最大300px，卡片页移动动画最大240px
let topbarDisplayTriggerScrollY = 500;

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
        // 向下滚动
        if (Math.abs(window.scrollY - lastScrollChange.scrollY) > topbarDisplayTriggerScrollY) {
            toggleShowTopbar(false);
            // 触发变化，记录变化的点
            lastScrollChange = {
                scrollDown: scrollDown,
                scrollY: window.scrollY
            };
        }
    } else {
        // 向上滚动
        if (Math.abs(window.scrollY - lastScrollChange.scrollY) > topbarDisplayTriggerScrollY) {
            toggleShowTopbar(true);
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
    consoleDebug("ToggleShowTopbar " + show)
    if (show) {
        if (topAppBarE.style.transform.length > 0) {
            consoleDebug("ToggleShowTopbar setTransform null")
            topAppBarE.style.transform = ""
        }
    } else {
        if (topAppBarE.style.transform.length == 0) {
            const topbarHeight = topAppBarE.clientHeight
            const topbarTranslateY = -(topbarHeight + 50)
            const transformStr = "translateY(" + topbarTranslateY + "px)"
            consoleDebug("ToggleShowTopbar setTransform " + transformStr)
            topAppBarE.style.transform = transformStr
        }
    }
}
