import { isChrome, isMobileOrTablet, isSafari, toggleClassWithEnable } from "../util/tools";
import { consoleDebug } from "../util/log";
import { localRepository } from "../repository/LocalRepository";
import { iconToggleTheme, toggleTopbarGlass } from "./topbar";

export const darkClass = "dark"

export function initTheme() {
    checkUserTheme()
    // 监听系统级主题变化，即系统和导航栏都可以控制主题变化
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        let newSysTheme = e.matches ? "dark" : "light";
        consoleDebug("System theme change to " + newSysTheme)
        const autoThemeOn = localRepository.getTheme() === localRepository.VALUE_THEME_AUTO
        if (autoThemeOn) {
            const newSysThemeDark = newSysTheme === "dark"
            const currentThemeDark = document.querySelector("body").classList.contains(darkClass)
            if (currentThemeDark != newSysThemeDark) {
                // 响应系统的主题修改，即变化主题
                toggleTheme(false)
            }
        }
    });
}

const metaThemeColor = {
    light: "#ffffff",
    lightMobile: "#ffffff",
    lightChrome: "#ffffff",
    dark: "#111111",
    darkMobile: "#111111",
    darkChrome: "#111111",
}

const topbarBlur = {
    default: true,
    mobile: true,
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

export function toggleMetaThemeColor(show: boolean) {
    const bodyE = document.getElementsByTagName("body")[0]
    const currentDark = bodyE.classList.contains(darkClass)
    checkMetaThemeColor(currentDark, show)
}

/**
 * 设置浏览器的theme-color属性
 * @param {String} color 如果为null则删除属性
 */
export function setMetaThemeColor(color: string) {
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
 * 切换主题
 */
export function toggleTheme(saveUserSetting: boolean) {
    const bodyE = document.getElementsByTagName("body")[0]
    const currentDark = bodyE.classList.contains(darkClass)
    if (currentDark) {
        showThemeDark(false)
        if (saveUserSetting)
            saveTheme(localRepository.VALUE_THEME_LIGHT)
    } else {
        showThemeDark(true)
        if (saveUserSetting)
            saveTheme(localRepository.VALUE_THEME_DARK)
    }
}

/**
 * 设置主题，更改ThemeButton显示的图标
 */
export function showThemeDark(dark: boolean) {
    const bodyE = document.getElementsByTagName("body")[0]
    toggleClassWithEnable(bodyE, darkClass, dark)
    iconToggleTheme.on = dark
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
    localRepository.setTheme(theme)
}

export function checkUserTheme() {
    const savedTheme = localRepository.getTheme()
    switch (savedTheme) {
        case localRepository.VALUE_THEME_AUTO: {
            const sysDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            if (sysDarkTheme) {
                showThemeDark(true)
            } else {
                showThemeDark(false)
            }
            break
        }
        case localRepository.VALUE_THEME_DARK: {
            showThemeDark(true);
            break
        }
        case localRepository.VALUE_THEME_LIGHT: {
            showThemeDark(false);
            break
        }
        default: {
            // 默认设置为亮色主题
            showThemeDark(false);
            break
        }
    }
}
