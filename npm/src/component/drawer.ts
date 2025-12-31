// import "./drawer.scss"
import {MDCDrawer} from "@material/drawer";
import {MDCList} from "@material/list";
import {consoleDebug, consoleError} from "../util/log";
import {topAppBar} from "./topbar";
import {MDCRipple} from "@material/ripple";
import {showAboutMeDialog} from "./dialog/AboutMeDialog";
import {showPreferenceDialog} from "./dialog/PreferenceDialog";
import {showSearchDialog} from "./dialog/SearchDialog";
import { getSectionTypeByPath, SECTION_TYPE_LENS, SECTION_TYPE_OPERA, SECTION_TYPE_POETRY, SECTION_TYPE_REPOST, SECTION_TYPE_TAG } from "../base/constant";
import { toggleClassWithEnable } from "../util/tools";

const DRAWER_ITEM_ORIGINAL_ID = "drawer-a-original"
const DRAWER_ITEM_REPOST_ID = "drawer-a-repost"
const DRAWER_ITEM_POETRY_ID = "drawer-a-poetry"
const DRAWER_ITEM_OPERA_ID = "drawer-a-opera"
const DRAWER_ITEM_LENS_ID = "drawer-a-lens"
const DRAWER_ITEM_TAG_ID = "drawer-a-tag"
const DRAWER_ITEM_SEARCH_ID = "drawer-a-search"
const DRAWER_ITEM_PREFERENCE_ID = "drawer-a-preference"
const DRAWER_ITEM_ABOUT_ME_ID = "drawer-a-about-me"

export function initDrawer() {
    let drawerE = document.querySelector(".mdc-drawer")
    if (drawerE == null) {
        consoleError("Drawer not found")
        return
    }
    let drawer = MDCDrawer.attachTo(drawerE)
    // 监听menu按钮点击
    topAppBar?.listen("MDCTopAppBar:nav", () => {
        drawer.open = !drawer.open
    })
    // 监听trigger弹出Drawer
    const toggleDowers = document.querySelectorAll(".drawer-trigger")
    for (const toggle of toggleDowers) {
        toggle.addEventListener("click", () => {
            drawer.open = !drawer.open
        })
    }

    // drawer中的list
    const listE = document.querySelector(".mdc-drawer .mdc-deprecated-list")
    if (listE == null) {
        consoleError("Drawer list not found")
        return
    }
    const aEList = listE.querySelectorAll("a.mdc-deprecated-list-item")
    const drawerList = MDCList.attachTo(listE)
    drawerList.singleSelection = true;
    const currentPageIndex = getCurrentPageIndex(aEList)
    const currentSelectedAE = aEList[currentPageIndex] as HTMLElement
    drawerList.listElements.map((listItemEl) => new MDCRipple(listItemEl))
    drawerList.selectedIndex = currentPageIndex
    drawerE.addEventListener("MDCDrawer:opened", () => {
        // Drawer弹出时禁止body滚动
        toggleClassWithEnable(document.body, "mdc-drawer-scroll-lock", true)
        currentSelectedAE.focus()
        currentSelectedAE.blur()
    });
    drawerE.addEventListener("MDCDrawer:closed", () => {
        toggleClassWithEnable(document.body, "mdc-drawer-scroll-lock", false)
        // 恢复选中
        // drawerList.selectedIndex = currentPageIndex
    });

    consoleDebug("Drawer currentPageIndex " + currentPageIndex)
    listE.addEventListener("click", () => {
        // 恢复选中
        drawerList.selectedIndex = currentPageIndex
        currentSelectedAE.focus()
        currentSelectedAE.blur()
    });

    const searchE = listE.querySelector("#" + DRAWER_ITEM_SEARCH_ID)
    if (searchE == null) {
        consoleError("Drawer search item not found")
        return
    }
    const searchEHref = searchE.getAttribute("href")
    searchE.addEventListener("click", () => {
        if (searchEHref == null || searchEHref == "") {
            consoleDebug("Click drawer list item " + DRAWER_ITEM_SEARCH_ID)
            showSearchDialog()
            drawer.open = false;
        }
    })
    listE.querySelector("#" + DRAWER_ITEM_PREFERENCE_ID)?.addEventListener("click", () => {
        consoleDebug("Click drawer list item " + DRAWER_ITEM_PREFERENCE_ID)
        showPreferenceDialog()
        drawer.open = false;
    })
    listE.querySelector("#" + DRAWER_ITEM_ABOUT_ME_ID)?.addEventListener("click", () => {
        consoleDebug("Click drawer list item " + DRAWER_ITEM_ABOUT_ME_ID)
        showAboutMeDialog()
        drawer.open = false;
    })
}

function getCurrentPageIndex(aEList: NodeListOf<Element>) {
    let section = getSectionTypeByPath(window.location.pathname)
    if (section.identifier == SECTION_TYPE_REPOST.identifier) {
        return findIndexById(aEList, DRAWER_ITEM_REPOST_ID)
    } else if (section.identifier == SECTION_TYPE_POETRY.identifier) {
        return findIndexById(aEList, DRAWER_ITEM_POETRY_ID)
    } else if (section.identifier == SECTION_TYPE_OPERA.identifier) {
        return findIndexById(aEList, DRAWER_ITEM_OPERA_ID)
    } else if (section.identifier == SECTION_TYPE_LENS.identifier) {
        return findIndexById(aEList, DRAWER_ITEM_LENS_ID)
    } else if (section.identifier == SECTION_TYPE_TAG.identifier) {
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
    return 0
}
