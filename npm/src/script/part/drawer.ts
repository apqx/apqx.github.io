import { MDCDrawer } from "@material/drawer";
import { MDCList } from "@material/list";
import { console_debug } from "../util/LogUtil";
import { topAppBar } from "./topbar";
import { showAboutMeDialog } from "../component/AboutMeDialog";
import { showPreferenceDialog } from "../component/PreferenceDialog";
import { showSearchDialog } from "../component/SearchDialog";
import { MDCRipple } from "@material/ripple";

const DRAWER_ITEM_ORIGINAL_ID = "drawer-a-original"
const DRAWER_ITEM_REPOST_ID = "drawer-a-repost"
const DRAWER_ITEM_POETRY_ID = "drawer-a-poetry"
const DRAWER_ITEM_OPERA_ID = "drawer-a-opera"
const DRAWER_ITEM_TAG_ID = "drawer-a-tag"
const DRAWER_ITEM_SEARCH_ID = "drawer-a-search"
const DRAWER_ITEM_PREFERENCE_ID = "drawer-a-preference"
const DRAWER_ITEM_ABOUT_ME_ID = "drawer-a-about-me"

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
    const listE: HTMLElement = document.querySelector(".mdc-drawer .mdc-deprecated-list")
    const aEList = listE.querySelectorAll("a.mdc-deprecated-list-item")
    const drawerList = MDCList.attachTo(listE)
    drawerList.singleSelection = true;
    const currentPageIndex = getCurrentPageIndex(aEList)
    drawerList.listElements.map((listItemEl) => new MDCRipple(listItemEl))

    drawerList.selectedIndex = currentPageIndex
    drawerE.addEventListener("MDCDrawer:opened", () => {
        drawerHeaderHideIcon.focus()
        drawerHeaderHideIcon.blur()
    });
    drawerE.addEventListener("MDCDrawer:closed", () => {
        // 恢复选中
        // drawerList.selectedIndex = currentPageIndex
    });

    console_debug("Drawer currentPageIndex " + currentPageIndex)
    listE.addEventListener("click", () => {
        // 恢复选中
        drawerList.selectedIndex = currentPageIndex
        drawerHeaderHideIcon.focus()
        drawerHeaderHideIcon.blur()
    });

    listE.querySelector("#" + DRAWER_ITEM_SEARCH_ID).addEventListener("click", () => {
        console_debug("Click drawer list item " + DRAWER_ITEM_SEARCH_ID)
        showSearchDialog()
        drawer.open = false;
    })
    listE.querySelector("#" + DRAWER_ITEM_PREFERENCE_ID).addEventListener("click", () => {
        console_debug("Click drawer list item " + DRAWER_ITEM_PREFERENCE_ID)
        showPreferenceDialog()
        drawer.open = false;
    })
    listE.querySelector("#" + DRAWER_ITEM_ABOUT_ME_ID).addEventListener("click", () => {
        console_debug("Click drawer list item " + DRAWER_ITEM_ABOUT_ME_ID)
        showAboutMeDialog()
        drawer.open = false;
    })
}

function getCurrentPageIndex(aEList: NodeListOf<Element>) {
    let path = window.location.pathname
    if (path.match("/section/repost.*") || path.match("/post/repost/.*")) {
        return findIndexById(aEList, DRAWER_ITEM_REPOST_ID)
    } else if (path.match("/section/poetry.*") || path.match("/post/poetry/.*")) {
        return findIndexById(aEList, DRAWER_ITEM_POETRY_ID)
    } else if (path.match("/section/opera.*") || path.match("/post/opera/.*")) {
        return findIndexById(aEList, DRAWER_ITEM_OPERA_ID)
    } else if (path.match("/section/tag.*")) {
        return findIndexById(aEList, DRAWER_ITEM_TAG_ID)
    } else {
        // 其余所有页面都显示随笔板块
        return findIndexById(aEList, DRAWER_ITEM_ORIGINAL_ID)
    }
}

function findIndexById(aEList: NodeListOf<Element>, id: string) {
    for (let i = 0; i < aEList.length; i++) {
        const aE = aEList[i]
        if (aE.getAttribute("id") == id) {
            return i
        }
    }
    return -1
}
