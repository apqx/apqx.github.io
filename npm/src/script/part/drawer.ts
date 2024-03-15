import {MDCDrawer} from "@material/drawer";
import {MDCList} from "@material/list";
import {MDCListActionEvent} from "@material/list/types";
import {console_debug} from "../util/LogUtil";
import {topAppBar} from "./topbar";
import {showAboutMeDialog} from "../component/AboutMeDialog";
import {showPreferenceDialog} from "../component/PreferenceDialog";
import {showSearchDialog} from "../component/SearchDialog";
import {MDCRipple} from "@material/ripple";

const INDEX = {
    // 随笔
    original: 0,
    // 转载
    repost: 1,
    // 诗文
    poetry: 2,
    // 看剧
    opera: 3,
    // 标签
    tag: 4,
    // 搜索
    search: 5,
    // 偏好
    preference: 6,
    // 关于我
    about: 7,
}

/**
 * 初始化Top app bar，Drawer
 */
export function initDrawer() {
    let drawerE = document.querySelector(".mdc-drawer")
    let drawer = MDCDrawer.attachTo(drawerE)
    // 监听menu按钮点击
    topAppBar.listen("MDCTopAppBar:nav", () => {
        drawer.open = !drawer.open
    })
    // 监听trigger弹出Drawer
    const toggleDowers = document.querySelectorAll(".drawer-trigger")
    for (const toggle of toggleDowers) {
        toggle.addEventListener("click", () => {
            drawer.open = !drawer.open
        })
    }
    let drawerHeaderHideIcon: HTMLElement = document.querySelector("#drawer-header-hide-icon")

    // drawer中的list
    const listEl: HTMLElement = document.querySelector(".mdc-drawer .mdc-deprecated-list")
    const drawerList = MDCList.attachTo(listEl)
    let currentPageIndex = getCurrentPageIndex()
    drawerList.listElements.map((listItemEl) => new MDCRipple(listItemEl))

    drawerList.selectedIndex = currentPageIndex
    drawerE.addEventListener('MDCDrawer:opened', () => {
        drawerList.selectedIndex = currentPageIndex
        drawerHeaderHideIcon.focus()
        drawerHeaderHideIcon.blur()
    });
    drawerE.addEventListener('MDCDrawer:closed', () => {
        // mainContentEl.querySelector<HTMLElement>('input, button').focus();
    });

    console_debug("drawer currentPageIndex " + currentPageIndex)
    drawerList.listen("MDCList:action", (event: MDCListActionEvent) => {
        // 获取点击的item索引
        console_debug("click drawer list item " + event.detail.index)
        if (event.detail.index > INDEX.tag) {
            // 点击了除 索引组 之外的item，关闭drawer
            drawer.open = false
        } else {
            // 点击了 索引组 的item，不要关闭Drawer，可能会因为页面跳转Drawer的状态无法还原成close，导致再退回到跳转前的页面时
            // drawer状态不对，无法打开drawer
        }
    })
    document.querySelector("#drawer-a-search").addEventListener("click", () => {
        showSearchDialog()
    })
    document.querySelector("#drawer-a-preference").addEventListener("click", () => {
        showPreferenceDialog()
    })
    document.querySelector("#drawer-a-about-me").addEventListener("click", () => {
        showAboutMeDialog()
    })
}

function getCurrentPageIndex() {
    let path = window.location.pathname
    if (path.match("/section/repost.*") || path.match("/post/repost/.*")) {
        return INDEX.repost
    } else if (path.match("/section/poetry.*") || path.match("/post/poetry/.*")) {
        return INDEX.poetry
    } else if (path.match("/section/opera.*") || path.match("/post/opera/.*")) {
        return INDEX.opera
    } else if (path.match("/section/tag.*")) {
        return INDEX.tag
    } else {
        // 其余所有页面都显示随笔板块
        return INDEX.original
    }
}


