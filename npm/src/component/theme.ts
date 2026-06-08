// import "./theme.scss"
import { isMobileOrTablet, toggleElementClass } from "../util/tools"
import { consoleInfo } from "../util/log"
import { getLocalRepository } from "../repository/LocalDb"
import { setToggleThemeIconDarkOn, toggleTopbarGlass } from "./topbar"
import { showSnackbar } from "./react/Snackbar"
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter, type Events } from "./base/EventBus"
import { applyModernM3Theme, materialYouThemeFromSourceColor, type MaterialYouTheme } from "../util/material"

export const darkClass = "dark"

let dynamicTheme: MaterialYouTheme | null = null

export function initTheme() {
    initDynamicThemeColor()
    checkColorfulToolbar()
    checkUserTheme()
    // 监听系统级主题变化，即系统和导航栏都可以控制主题变化
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        let newSysTheme = e.matches ? "dark" : "light";
        consoleInfo("System theme change to " + newSysTheme)
        checkUserTheme()
    });
    getEventEmitter().on("themeChange", (data: Events["themeChange"]) => {
        consoleInfo("Theme receive themeChange event, theme = " + data.theme + ", showToast = " + data.showToast)
        checkColorfulToolbar()
        checkUserTheme(data.showToast)
    })
    getEventEmitter().on("pageEvent", (data: Events["pageEvent"]) => {
        consoleInfo("Theme receive pageEvent, event = " + data)
        if (data == EVENT_PAGE_BACK_FROM_CACHE) {
            checkColorfulToolbar()
            checkUserTheme()
        }
    })
}

function initDynamicThemeColor() {
    // 生成 Material You 主题色插入到 CSS 变量中
    // https://material-web.dev/theming/color/
    dynamicTheme = materialYouThemeFromSourceColor('#5a5fc1');
}

export function isDarkThemeFromDocument(): boolean {
    return document.body.classList.contains(darkClass)
}

export function isDarkThemeFromSysAndUserSettings(): boolean {
    const sysDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = getLocalRepository().getTheme()
    if (savedTheme === getLocalRepository().VALUE_THEME_AUTO) {
        return sysDarkTheme
    } else {
        return savedTheme === getLocalRepository().VALUE_THEME_DARK
    }
}

const metaThemeColor = {
    lightColorful: "#556a3b",
    darkColorful: "#556a3b",
    light: "#ffffff",
    dark: "#161616"
}

// TODO: 根据是否启用 edge-to-edge 设置
const topbarBlur = {
    default: true,
    mobile: true,
}

// 是否启用彩色标题栏
// 在使用 Material You 的 Android Chrome 上，浅色主题的主题色不会影响 Chrome 工具栏和状态栏颜色，需要设置更深的主题色才会生效
// 深色模式下则完全不影响，所以不必设置
const colorfulToolbar = false

function checkMetaThemeColor(dark: boolean, show: boolean) {
    if (show) {
        if (document.querySelector(".colorful") != null) {
            setMetaThemeColor(dark ? metaThemeColor.darkColorful : metaThemeColor.lightColorful)
        } else {
            setMetaThemeColor(dark ? metaThemeColor.dark : metaThemeColor.light)
        }
    } else {
        setMetaThemeColor(undefined)
    }
    if (isMobileOrTablet()) {
        toggleTopbarGlass(topbarBlur.mobile)
    } else {
        toggleTopbarGlass(topbarBlur.default)
    }
}

function checkColorfulToolbar() {
    if (colorfulToolbar) {
        toggleElementClass(document.querySelector(".mdc-top-app-bar") as HTMLElement, "colorful", true)
    }
}

/**
 * 设置浏览器 theme-color 属性
 * @param {String} color 如果为 undefined 则删除属性
 */
export function setMetaThemeColor(color?: string) {
    consoleInfo("SetThemeColor " + color)
    let themeColorE = null
    for (const metaE of document.getElementsByTagName("meta")) {
        if (metaE.getAttribute("name") === "theme-color") {
            themeColorE = metaE
            break
        }
    }
    if (color == null) {
        if (themeColorE != null) {
            themeColorE.remove()
        }
    } else {
        if (themeColorE == null) {
            themeColorE = document.createElement("meta")
            themeColorE.setAttribute("name", "theme-color")
            themeColorE.setAttribute("content", color)
            document.getElementsByTagName("head")[0].append(themeColorE)
        } else {
            themeColorE.setAttribute("content", color)
        }
    }
}

/**
 * 根据用户设置切换主题
 */
export function toggleTheme() {
    const themeArray = [getLocalRepository().VALUE_THEME_AUTO, getLocalRepository().VALUE_THEME_DARK, getLocalRepository().VALUE_THEME_LIGHT]
    const currentTheme = getLocalRepository().getTheme()
    const currentThemeIndex = themeArray.indexOf(currentTheme)
    const nextThemeIndex = (currentThemeIndex + 1) % themeArray.length
    const nextTheme = themeArray[nextThemeIndex]
    consoleInfo("Toggle theme, current = " + currentTheme + ", next = " + nextTheme)
    saveTheme(nextTheme)
    getEventEmitter().emit("themeChange", {
        theme: nextTheme,
        showToast: true
    })
}

/**
 * 设置主题，更改ThemeButton显示的图标
 */
export function showThemeDark(dark: boolean) {
    const bodyE = document.body
    toggleElementClass(bodyE, darkClass, dark)
    setToggleThemeIconDarkOn(dark)
    checkMetaThemeColor(dark, true)
    // 当切换主题的时候，检查是否需要修改theme-color
    // 目前不需要，只切换暗色、亮色主题，而设置的亮色theme-color在系统级暗色主题下无效，还不如直接交给浏览器去自动检测呢
}

/**
 * 保存用户设置的主题
 * @param {string} theme 主题
 */
function saveTheme(theme: string) {
    consoleInfo("Save theme = " + theme)
    getLocalRepository().saveTheme(theme)
}

export function checkUserTheme(showToast: boolean = false) {
    const dark = isDarkThemeFromSysAndUserSettings()
    if (dynamicTheme != null) {
        applyModernM3Theme(dynamicTheme, dark)
    }
    showThemeDark(dark)
    if (!showToast) return

    const savedTheme = getLocalRepository().getTheme()
    switch (savedTheme) {
        case getLocalRepository().VALUE_THEME_AUTO: {
            if (showToast) {
                showSnackbar("已设置主题跟随系统")
            }
            break
        }
        case getLocalRepository().VALUE_THEME_DARK: {
            if (showToast) {
                showSnackbar("已切换到暗色主题")
            }
            break
        }
        case getLocalRepository().VALUE_THEME_LIGHT: {
            if (showToast) {
                showSnackbar("已切换到亮色主题")
            }
            break
        }
        default: {
            // 默认使用系统主题
            if (showToast) {
                showSnackbar("主题跟随系统")
            }
            break
        }
    }
}