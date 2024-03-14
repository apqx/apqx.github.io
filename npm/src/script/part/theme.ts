import {isMobileOrTablet, toggleClassWithEnable} from "../util/Tools";
import {console_debug} from "../util/LogUtil";
import {localRepository} from "../repository/LocalRepository";
import {iconToggle} from "./topbar";

export const darkClass = "dark"

export function checkThemeColor() {
    if (isMobileOrTablet()) {
        // 在mobile或tablet设备上添加theme-color，无论是暗色还是亮色主题，都设置浏览器标题栏theme-color主题颜色为淡红色
        // <meta name="theme-color" content="#df696e" />
        setThemeColor("#df696e")
    } else {
        // desktop设备上，topBar固定背景模糊
        // const topBarE = document.getElementById("top_app_bar")
        // topBarE.classList.add("mdc-top-app-bar--fixed")
        // topBarE.classList.add("top-app-bar--blur")

        // 在desktop设备上，暗色和亮色主题下，分别设置theme-color为background，若不设置，Safari会自动使用检测到的background颜色作为theme-color
        // 但是在系统暗色主题下，设置亮色的theme-color是无效的，所以，也就没必要再区分设置了，直接由Safari自动检测就行了
        // if (showThemeDark) {
        //     setThemeColor("rgb(32, 33, 36)")
        // } else {
        //     setThemeColor("#f7f7f7")
        // }
    }
}

/**
 *
 * @param {String} color
 */
function setThemeColor(color: string) {
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
}

/**
 * 保存用户设置的主题
 * @param {string} theme 主题
 */
export function saveTheme(theme: string) {
    console_debug("save theme = " + theme)
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
        }
    }
}