// import "./fab.scss"

import { getSectionTypeByPath, isIndexPage, SECTION_TYPE_LENS } from "../base/constant"
import { isChrome, isSafari } from "../util/tools"
import { getInterSectionObserver } from "./animation/BaseAnimation"
import { setupIconButtonRipple } from "./button"
import { showSnackbar } from "./react/Snackbar"

export function initFab() {
    // 仅在 Index 透镜分区页面显示搜索 Fab
    const path = document.location.pathname
    const keepFabSearch = isIndexPage(path) && getSectionTypeByPath(path).identifier == SECTION_TYPE_LENS.identifier
    if (!keepFabSearch) {
        const fabSearchWrapperE = document.querySelector("#fabSearchWrapper")
        if (fabSearchWrapperE != null) {
            fabSearchWrapperE?.parentElement?.removeChild(fabSearchWrapperE)
        }
    } else {
        const fabSearchE = document.querySelector("#fabSearch")
        if (fabSearchE != null) {
            setupIconButtonRipple(fabSearchE)
            getInterSectionObserver().observe(fabSearchE.parentElement as HTMLElement)
            fabSearchE?.addEventListener("click", () => {
                showSnackbar("功能建设中")
            })
        }
    }

    // Fab 默认隐藏，使用 Intersection Observer 监听显示动画
    const fabUpE = document.querySelector("#fabUp") as HTMLElement
    if (fabUpE != null) {
        setupIconButtonRipple(fabUpE)
        getInterSectionObserver().observe(fabUpE.parentElement as HTMLElement)
        fabUpE?.addEventListener("click", () => {
            // if (isSafari()) {
            //     scrollToTop()
            // } else {
            //     scrollToTopNative()
            // }
            scrollToTopNative()
            fabUpE.focus()
        })
    }
}

let lastScrollY = -1

function scrollToTop() {
    const scrollY = window.scrollY
    if (lastScrollY != -1 && scrollY > lastScrollY) {
        // 用户中断
        lastScrollY = -1
        return
    }
    if (scrollY > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, scrollY - scrollY / 15)
    }
    lastScrollY = scrollY
    if (lastScrollY <= 0) lastScrollY = -1
}

/**
 * 使用原生平滑滚动，但 smooth 在 2022 年的 iOS safari 15.4 中才开始支持
 */
function scrollToTopNative() {
    window.scrollTo({ top: 0, behavior: "smooth" })
}
