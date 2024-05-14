import {MDCIconButtonToggle} from "@material/icon-button";
import {consoleDebug, consoleError} from "../util/log";
import {checkUserTheme, darkClass, toggleTheme} from "./theme";
import {localRepository} from "../repository/LocalRepository";
import {MDCTopAppBar} from "@material/top-app-bar";
import {isMobileOrTablet, toggleClassWithEnable} from "../util/tools";
// import "./topbar.scss"

export var iconToggle: MDCIconButtonToggle = null
export var topAppBar: MDCTopAppBar = null
export var topAppBarE: HTMLElement = null

export function refreshTopbar() {
    // 如果可以刷新Topbar就不用刷新页面了
    // topAppBar.destroy()
    // topAppBar = new MDCTopAppBar(document.querySelector(".mdc-top-app-bar"))
    // topAppBar.initialSyncWithDOM()
    location.reload()
}

export function initTopbar() {
    const bodyE = document.querySelector("body")
    const btnThemeE = document.querySelector("#topbar_btn_theme")
    topAppBarE = document.querySelector(".mdc-top-app-bar")
    checkFixedTopbar();
    topAppBar = new MDCTopAppBar(topAppBarE)
    iconToggle = new MDCIconButtonToggle(btnThemeE)
    // 监听topbar的主题切换按钮
    btnThemeE.addEventListener("click", () => {
        // toggleButton会自动toggle图标
        toggleTheme(true)
    });
    // 监听系统级主题变化，即系统和导航栏都可以控制主题变化，但是如果用户曾经在导航栏设置过主题，则不响应系统变化？？？
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        let newSysTheme = e.matches ? "dark" : "light";
        consoleDebug("System theme change to " + newSysTheme)
        const autoThemeOn = localRepository.getTheme() === localRepository.VALUE_THEME_AUTO
        if (autoThemeOn) {
            const newSysThemeDark = newSysTheme === "dark"
            const currentThemeDark = bodyE.classList.contains(darkClass)
            if (currentThemeDark != newSysThemeDark) {
                // 响应系统的主题修改，即变化主题
                toggleTheme(false)
            }
        }

    });
    document.querySelector("#topbar_btn_about_me").addEventListener("click", () => {
        import("./dialog/AboutMeDialog").then((dialog) => {
            dialog.showAboutMeDialog()
        }).catch((e) => {
            consoleError(e)
        })
    })
}

function checkFixedTopbar() {
    let on = localRepository.getFixedTopbarOn()
    setFixedTopbar(on)
}

export function setFixedTopbar(on: boolean) {
    toggleClassWithEnable(topAppBarE, "mdc-top-app-bar--fixed", on)
    // 只有桌面浏览器才设置毛玻璃，和theme-color的判断条件一致，毛玻璃和theme-color难以搭配，索性不搭
    if (isMobileOrTablet()) {
        // 移动设备会设置theme-color，不启用毛玻璃
    } else {
        // 桌面设备不设置theme-color，启用毛玻璃
        toggleClassWithEnable(topAppBarE, "top-app-bar--blur", on)
    }
}
