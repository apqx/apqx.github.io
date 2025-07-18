// import "./theme.scss"
import { isChrome, isMobileOrTablet, toggleClassWithEnable } from "../util/tools"
import { consoleDebug } from "../util/log"
import { getLocalRepository } from "../repository/LocalRepository"
import { iconToggleTheme, toggleTopbarGlass } from "./topbar"
import { showSnackbar } from "./react/Snackbar"

export const darkClass = "dark"

export function initTheme() {
    checkUserTheme()
    // 监听系统级主题变化，即系统和导航栏都可以控制主题变化
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        let newSysTheme = e.matches ? "dark" : "light";
        consoleDebug("System theme change to " + newSysTheme)
        const autoThemeOn = getLocalRepository().getTheme() === getLocalRepository().VALUE_THEME_AUTO
        if (autoThemeOn) {
            const newSysThemeDark = newSysTheme === "dark"
            const currentThemeDark = document.body.classList.contains(darkClass)
            if (currentThemeDark != newSysThemeDark) {
                // 响应系统的主题修改，即变化主题
                showThemeDark(newSysThemeDark);
            }
        }
    });
}

const metaThemeColor = {
    light: "#ffffff",
    lightMobile: "#ffffff",
    lightChrome: "#ffffff",
    dark: "#1d1d1d",
    darkMobile: "#1d1d1d",
    darkChrome: "#1d1d1d",
}

const topbarBlur = {
    default: true,
    mobile: false,
}

function checkMetaThemeColor(dark: boolean, show: boolean) {
    // 黑配色
    if (show) {
        if (dark) {
            if (isChrome()) {
                setMetaThemeColor(metaThemeColor.darkChrome)
            } else if (isMobileOrTablet()) {
                setMetaThemeColor(metaThemeColor.darkMobile)
            } else {
                setMetaThemeColor(metaThemeColor.dark)
            }
        } else {
            if (isChrome()) {
                setMetaThemeColor(metaThemeColor.lightChrome)
            } else if (isMobileOrTablet()) {
                setMetaThemeColor(metaThemeColor.lightMobile)
            } else {
                setMetaThemeColor(metaThemeColor.light)
            }
        }
    } else {
        setMetaThemeColor(null)
    }
    if (isMobileOrTablet()) {
        toggleTopbarGlass(topbarBlur.mobile)
    } else {
        toggleTopbarGlass(topbarBlur.default)
    }
}

/**
 * 设置浏览器的theme-color属性
 * @param {String} color 如果为null则删除属性
 */
export function setMetaThemeColor(color: string | null) {
    consoleDebug("SetThemeColor " + color)
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
    const currentTheme = getLocalRepository().getTheme() ?? getLocalRepository().VALUE_THEME_AUTO
    const currentThemeIndex = themeArray.indexOf(currentTheme)
    const nextThemeIndex = (currentThemeIndex + 1) % themeArray.length
    const nextTheme = themeArray[nextThemeIndex]
    consoleDebug("Toggle theme, current = " + currentTheme + ", next = " + nextTheme)

    switch (nextTheme) {
        case getLocalRepository().VALUE_THEME_AUTO: {
            applySystemTheme()
            showSnackbar("已设置主题跟随系统")
            break
        }
        case getLocalRepository().VALUE_THEME_DARK: {
            showThemeDark(true)
            showSnackbar("已切换到暗色主题")
            break
        }
        case getLocalRepository().VALUE_THEME_LIGHT: {
            showThemeDark(false)
            showSnackbar("已切换到亮色主题")
            break
        }
        default: {
            // 默认使用系统主题
            applySystemTheme()
            showSnackbar("主题跟随系统")
            break
        }
    }
    saveTheme(nextTheme)
}

/**
 * 设置主题，更改ThemeButton显示的图标
 */
export function showThemeDark(dark: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, darkClass, dark)
    iconToggleTheme!!.on = dark
    checkMetaThemeColor(dark, true)
    // 当切换主题的时候，检查是否需要修改theme-color
    // 目前不需要，只切换暗色、亮色主题，而设置的亮色theme-color在系统级暗色主题下无效，还不如直接交给浏览器去自动检测呢
}

/**
 * 保存用户设置的主题
 * @param {string} theme 主题
 */
export function saveTheme(theme: string) {
    consoleDebug("Save theme = " + theme)
    getLocalRepository().setTheme(theme)
}

export function checkUserTheme() {
    // 默认情况下 savedTheme 为 null
    const savedTheme = getLocalRepository().getTheme()
    switch (savedTheme) {
        case getLocalRepository().VALUE_THEME_AUTO: {
            applySystemTheme();
            break
        }
        case getLocalRepository().VALUE_THEME_DARK: {
            showThemeDark(true);
            break
        }
        case getLocalRepository().VALUE_THEME_LIGHT: {
            showThemeDark(false);
            break
        }
        default: {
            // 默认使用系统主题
            applySystemTheme();
            saveTheme(getLocalRepository().VALUE_THEME_AUTO);
            break
        }
    }
}

function applySystemTheme() {
    const sysDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (sysDarkTheme) {
        showThemeDark(true);
    } else {
        showThemeDark(false);
    }
}

