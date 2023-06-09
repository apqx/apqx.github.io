import { localRepository } from "../app"
import { iconToggle } from "../nav"
import { console_debug } from "./LogUtil"
import { toggleClassWithEnable } from "./Tools"

export const darkClass = "dark"

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
 * 设置主题，更改ThemeButton显示的图标，是否显示暗黑页面对应的要切换到亮色主题的图标
 */
export function showThemeDark(dark: boolean) {
    const bodyE = document.getElementsByTagName("body")[0]
    toggleClassWithEnable(bodyE, darkClass, dark)
    iconToggle.on = dark
    // 当切换主题的时候，检查是否需要修改theme-color
    // 目前不需要，只切换暗色、亮色主题，而设置的亮色theme-color在系统级暗色主题下无效，还不如直接交给浏览器去自动检测呢
    // checkBrowserColor(dark)
}

/**
 * 保存用户设置的主题
 * @param {string} theme 主题
 */
export function saveTheme(theme: string) {
    console_debug("save theme = " + theme)
    localRepository.setTheme(theme)
}

/**
 *
 * @param {String} color
 */
export function setThemeColor(color: string) {
    console_debug("setThemeColor " + color)
    let themeColorE = null
    for (const metaE of document.getElementsByTagName("meta")) {
        if (metaE.getAttribute("name") === "theme-color") {
            themeColorE = metaE
            break
        }
    }
    if (themeColorE == null) {
        themeColorE = document.createElement("meta")
        themeColorE.setAttribute("name", "theme-color")
        themeColorE.setAttribute("content", color)
        document.getElementsByTagName("head")[0].append(themeColorE)
    } else {
        themeColorE.setAttribute("content", color)

    }
}