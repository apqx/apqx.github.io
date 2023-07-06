// 处理导航相关
import { MDCTopAppBar } from "@material/top-app-bar"
import { MDCRipple } from "@material/ripple"
import { MDCDrawer } from "@material/drawer"
import { MDCList } from "@material/list"
import { MDCIconButtonToggle } from "@material/icon-button";
import { showAlertDialog } from "./component/CommonAlertDialog"
import { showAboutMeDialog } from "./component/AboutMeDialog";
import { showSearchDialog } from "./component/SearchDialog";
import { console_debug, console_error } from "./util/LogUtil";
import { MDCListActionEvent } from "@material/list/types";
import { showPreferenceDialog } from "./component/PreferenceDialog";
import { LocalRepository } from "./repository/LocalRepository";
import { isMobileOrTablet, toggleClassWithEnable } from "./util/Tools";
import { localRepository } from "./main";
import { darkClass, setThemeColor, showThemeDark, toggleTheme } from "./util/ThemeUtils";

// 初始化Chrome/Safari标题栏颜色，立即执行
// checkThemeColor()

var bodyE: HTMLBodyElement = null
export var iconToggle: MDCIconButtonToggle = null

export function initTheme() {
    try {
        checkThemeColor()
        bodyE = document.getElementsByTagName("body")[0]
        const btnThemeE = document.getElementById("topbar_btn_theme")
        iconToggle = new MDCIconButtonToggle(btnThemeE)
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
        if (btnThemeE != null) {
            btnThemeE.addEventListener("click", () => {
                toggleTheme(true)
            });
        }
        // 监听系统级主题变化，即系统和导航栏都可以控制主题变化，但是如果用户曾经在导航栏设置过主题，则不响应系统变化？？？
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
            var newSysTheme = e.matches ? "dark" : "light";
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

    } catch (e) {
        console_error("catch e = " + e.message);
    }
}

function checkThemeColor() {
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
 * 初始化Floating Action Button，点击回到顶部
 */
export function initFab() {
    // 为fab添加ripple动画
    const fabE = document.querySelector(".mdc-fab")
    if (fabE != null) {
        new MDCRipple(fabE)
        // topAppBar监听长按，把当前页编码后的URL复制到剪切板上
        fabE.addEventListener("long-press", () => {
            console_debug("long-press fab")
            showEncodedUrl()
        })
        fabE.addEventListener("click", () => {
            scrollToTop()
            // window.location.replace("#top")
        })
    }
}

function showEncodedUrl() {
    const url = window.location.href
    const urlLink = "当前页面的编码URL为<a href=\"" + url + "\">此链接</a>"
    showAlertDialog("提示", urlLink, "OK", () => {
    })
}

// 依赖jQuery
function scrollToTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, c - c / 8)
    }
}


/**
 * 初始化Top app bar，Drawer
 */
export function initDrawer() {
    let drawer
    try {
        const topAppBarE = document.querySelector(".mdc-top-app-bar")

        const topAppBar = new MDCTopAppBar(topAppBarE)
        // 监听menu按钮点击
        topAppBar.listen("MDCTopAppBar:nav", () => {
            drawer.open = !drawer.open
        })
        // 监听弹出Drawer
        const toggleDowers = document.querySelectorAll(".toggle-drawer")
        for (const toggle of toggleDowers) {
            toggle.addEventListener("click", () => {
                drawer.open = !drawer.open
            })
        }
        drawer = MDCDrawer.attachTo(document.querySelector(".mdc-drawer"))
        // drawer中的list
        const listEl = document.querySelector(".mdc-drawer .mdc-deprecated-list")
        const drawerList = new MDCList(listEl)
        const mainContentEl = document.querySelector(".main-content")
        const originalSelectedItem = drawerList.selectedIndex
        console_debug("drawer originalSelectedItem " + originalSelectedItem)
        drawerList.listen("MDCList:action", (event: MDCListActionEvent) => {
            // 获取点击的item索引
            console_debug("click drawer list item " + event.detail.index)
            // 点击会跳转到新的页面，但是当前页面应该保持，还原到原来的选中状态
            drawerList.selectedIndex = originalSelectedItem
            if (event.detail.index > 4) {
                // 点击了除 索引组 之外的item，关闭drawer
                drawer.open = false
            } else {
                // 点击了 索引组 的item，不要关闭Drawer，可能会因为页面跳转Drawer的状态无法还原成close，导致再退回到跳转前的页面时，drawer状态不对，无法打开drawer
            }
        })

    } catch (e) {
        console_debug("catch e = " + e.message)
    }
}

/**
 * 初始化关于我dialog
 */
export function initAboutMeDialog() {
    document.getElementById("topbar_btn_about_me").addEventListener("click", () => {
        showAboutMeDialog()
    })
    // 侧边导航的关于我
    document.getElementById("drawer-a-about-me").addEventListener("click", () => {
        showAboutMeDialog()
    })
}

/**
 * 初始化搜索Dialog
 */
export function initSearchDialog() {
    document.getElementById("drawer-a-search").addEventListener("click", () => {
        showSearchDialog()
    })
}

/**
 * 初始化偏好Dialog
 */
export function initPreferenceDialog() {
    document.getElementById("drawer-a-preference").addEventListener("click", () => {
        showPreferenceDialog()
    })
}

export function initHandwritingFont() {
    const localRepository = new LocalRepository()
    const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    const bodyE = document.getElementsByTagName("body")[0];
    toggleClassWithEnable(bodyE, "handwriting", localHandWritingFontOn)
}