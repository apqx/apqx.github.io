import {MDCIconButtonToggle} from "@material/icon-button";
import {console_debug} from "../util/LogUtil";
import {checkUserTheme, darkClass, toggleTheme} from "./theme";
import {localRepository} from "../repository/LocalRepository";
import {MDCTopAppBar} from "@material/top-app-bar";
import {showAboutMeDialog} from "../component/AboutMeDialog";
import { toggleClassWithEnable } from "../util/Tools";

export var iconToggle: MDCIconButtonToggle = null
export var topAppBar: MDCTopAppBar = null
var topAppBarE: HTMLElement = null

export function initTopbar() {
    const bodyE = document.querySelector("body")
    const btnThemeE = document.querySelector("#topbar_btn_theme")
    topAppBarE = document.querySelector(".mdc-top-app-bar")
    checkFixedTopbar();
    topAppBar = new MDCTopAppBar(topAppBarE)
    iconToggle = new MDCIconButtonToggle(btnThemeE)
    checkUserTheme();
    // 监听topbar的主题切换按钮
    btnThemeE.addEventListener("click", () => {
        // toggleButton会自动toggle图标
        toggleTheme(true)
    });
    // 监听系统级主题变化，即系统和导航栏都可以控制主题变化，但是如果用户曾经在导航栏设置过主题，则不响应系统变化？？？
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        let newSysTheme = e.matches ? "dark" : "light";
        console_debug("system theme change to " + newSysTheme)
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
        showAboutMeDialog()
    })
}

function checkFixedTopbar() {
    let on = localRepository.getFixedTopbarOn()
    setFixedTopbar(on)
}

export function setFixedTopbar(on: boolean) {
    toggleClassWithEnable(topAppBarE, "mdc-top-app-bar--fixed", on)
    toggleClassWithEnable(topAppBarE, "top-app-bar--blur", on)
}
