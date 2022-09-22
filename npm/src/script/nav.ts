// 处理导航相关
import {MDCTopAppBar} from "@material/top-app-bar"
import {MDCRipple} from "@material/ripple"
import {MDCDrawer} from "@material/drawer"
import {MDCList} from "@material/list"
import {MDCIconButtonToggle} from "@material/icon-button";
import {showAlertDialog} from "./component/CommonAlertDialog"
import {showAboutMeDialog} from "./component/AboutMeDialog";
import {showSearchDialog} from "./component/SearchDialog";
import {console_debug, console_error} from "./util/LogUtil";
import {MDCListActionEvent} from "@material/list/types";

// Theme主题相关常量
const THEME_LIGHT = "0"
const THEME_DARK = "1"
const KEY_THEME = "theme"

// 初始化Chrome/Safari标题栏颜色，立即执行
checkThemeColor()

export function initTheme() {
    try {
        const bodyE = document.getElementsByTagName("body")[0];
        const btnTheme = document.getElementById("topbar_btn_theme")
        const iconToggle = new MDCIconButtonToggle(btnTheme)
        if (isSavedThemeDark()) {
            bodyE.classList.add("dark");
            showThemeDark(true, iconToggle);
        } else {
            showThemeDark(false, iconToggle);
        }
        if (btnTheme != null) {
            btnTheme.addEventListener("click", () => {
                toggleTheme(bodyE, iconToggle)
            });
        }
        // 监听系统级主题变化，即系统和导航栏都可以控制主题变化，但是如果用户曾经在导航栏设置过主题，则不响应系统变化？？？
        // 暂不响应系统级主题变化
        // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        //     var newSysTheme = e.matches ? "dark" : "light";
        //     console_debug("system theme change to " + newSysTheme)
        //     var newSysThemeChangeToDark = newSysTheme == "dark"
        //     var isCurrentThemeDark = bodyE.classList.contains("dark")
        //     if(isCurrentThemeDark != newSysThemeChangeToDark) {
        //         // 响应系统的主题修改，即变化主题
        //         toggleTheme(bodyE, iconToggle)
        //     }
        // });

    } catch (e) {
        console_error("catch e = " + e.message);
    }
}

/**
 * 切换主题
 */
function toggleTheme(bodyE: Element, iconToggle: MDCIconButtonToggle) {
    if (bodyE.classList.contains("dark")) {
        bodyE.classList.remove("dark")
        showThemeDark(false, iconToggle)
        saveTheme(false)
    } else {
        bodyE.classList.add("dark")
        showThemeDark(true, iconToggle)
        saveTheme(true)
    }
}

/**
 * 设置ThemeButton显示的图标，是否显示暗黑页面对应的要切换到亮色主题的图标
 */
function showThemeDark(dark: boolean, iconToggle: MDCIconButtonToggle) {
    iconToggle.on = dark
    // 当切换主题的时候，检查是否需要修改theme-color
    // 目前不需要，只切换暗色、亮色主题，而设置的亮色theme-color在系统级暗色主题下无效，还不如直接交给浏览器去自动检测呢
    // checkBrowserColor(dark)
}

function isMobileOrTablet(): boolean {
    let check = false
    let agent = navigator.userAgent || navigator.vendor
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4)))
        check = true
    console_debug("isMobileOrTablet = " + check)
    return check
}

function checkThemeColor() {
    if (isMobileOrTablet()) {
        // 在mobile或tablet设备上添加theme-color，无论是暗色还是亮色主题，都设置浏览器标题栏theme-color主题颜色为淡红色
        // <meta name="theme-color" content="#df696e" />
        setThemeColor("#df696e")
    } else {
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
 * 本地是否保存了用户设置的暗色主题，默认是没有的，即默认是亮色主题
 */
function isSavedThemeDark() {
    let savedTheme = localStorage.getItem(KEY_THEME)
    return savedTheme === THEME_DARK
}

/**
 * 保存用户设置的主题
 * @param {Boolean} isDark 是否是暗色主题
 */
function saveTheme(isDark) {
    console_debug("save theme, dark = " + isDark)
    if (isDark) {
        localStorage.setItem(KEY_THEME, THEME_DARK)
    } else {
        localStorage.setItem(KEY_THEME, THEME_LIGHT)
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
    }
}

function showEncodedUrl() {
    const url = window.location.href
    const urlLink = "Copy this <a href=\"" + url + "\">link</a> to get encoded url"
    showAlertDialog("TIPS", urlLink , "OK", () => {
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