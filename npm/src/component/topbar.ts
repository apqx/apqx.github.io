import {MDCIconButtonToggle} from "@material/icon-button";
import {consoleDebug, consoleError} from "../util/log";
import {toggleTheme} from "./theme";
import {localRepository} from "../repository/LocalRepository";
import {MDCTopAppBar} from "@material/top-app-bar";
import {isMobileOrTablet, toggleClassWithEnable} from "../util/tools";
import {showAboutMeDialog} from "./dialog/AboutMeDialog";
// import "./topbar.scss"

export var iconToggleTheme: MDCIconButtonToggle = null
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
    const btnMenuE = document.querySelector("#topbar_btn_menu") as HTMLElement
    const btnThemeE = document.querySelector("#topbar_btn_theme") as HTMLElement
    const btnAboutMeE = document.querySelector("#topbar_btn_about_me") as HTMLElement
    topAppBarE = document.querySelector(".mdc-top-app-bar")
    checkFixedTopbar();
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
    btnMenuE.addEventListener("focus", () => {
        btnMenuE.blur()
    })
    btnThemeE.addEventListener("focus", () => {
        btnThemeE.blur()
    })
    btnAboutMeE.addEventListener("focus", () => {
        btnAboutMeE.blur()
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
