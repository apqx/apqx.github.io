// import "./index.scss"
import Masonry from "masonry-layout"
import { MDCRipple } from "@material/ripple"
import { runOnHtmlDone, runOnPageDone } from "../util/tools"
import { consoleArrayDebug, consoleDebug, consoleError, consoleObjDebug } from "../util/log"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { IndexList, Post } from "../component/react/IndexList"
import { getIndexType } from "../base"
import { POST_TYPE_OTHER } from "../base/constant"
import { HeightAnimationContainer } from "../component/animation/HeightAnimationContainer"
import { WidthResizeObserver } from "../base/WidthResizeObserver"
import { ImageLoadAnimator } from "../component/animation/ImageLoadAnimator"

runOnPageDone(() => {
    initCardRipple()
    initIndexTopCover()
    initIndexList()
    initGridIndex()
})

function initIndexList() {
    const wrapperE = document.querySelector("#index-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }
    // 获取已有的post，包括置顶和非置顶
    const loadedPosts = getLoadedPosts(wrapperE)
    const root = createRoot(wrapperE)
    const category = getIndexType(window.location.pathname).identifier
    consoleDebug("Index category = " + category + ", path = " + window.location.pathname)
    consoleObjDebug("Index loaded posts", loadedPosts)
    if (category == POST_TYPE_OTHER.identifier) return

    const heightAnimationContainerE = document.querySelector("#index-list-wrapper.height-animation-container") as HTMLElement
    const heightAnimationContainer = new HeightAnimationContainer(heightAnimationContainerE)
    const onUpdate = () => {
        // 当react更新时，动画更新wrapper高度
        heightAnimationContainer.update()
    }
    new WidthResizeObserver(wrapperE, () => {
        heightAnimationContainer.update()
    })
    root.render(<IndexList category={category} pinedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]} onUpdate={onUpdate} />)
}

function getLoadedPosts(wrapperE: HTMLElement): Array<Array<Post>> {
    const pinedPosts: Array<Post> = []
    const otherPosts: Array<Post> = []
    for (const liE of wrapperE.querySelectorAll(".index-li")) {
        const title = (liE.querySelector(".index-title") as HTMLElement).innerText
        const author = (liE.querySelector(".index-author") as HTMLElement).innerText
        const date = (liE.querySelector(".index-date") as HTMLElement).innerText
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).href
        const pin = liE.classList.contains("index-li--pin")
        if (pin) {
            pinedPosts.push({
                title: title,
                author: author,
                date: date,
                path: path,
                pin: pin,
                hide: false
            })
        } else {
            otherPosts.push({
                title: title,
                author: author,
                date: date,
                path: path,
                pin: pin,
                hide: false
            })
        }
    }
    const array = new Array<Array<Post>>()
    array.push(pinedPosts)
    array.push(otherPosts)
    return array
}

const INDEX_TOP_COVER_RATIO = 844 / 295

function initIndexTopCover() {
    for (const ele of document.querySelectorAll(".index-top-cover.height-animation")) {
        const imgE = ele as HTMLImageElement
        const imageLoadAnimator = new ImageLoadAnimator(imgE, INDEX_TOP_COVER_RATIO, true, null)
    }
}

let masonry: Masonry = null

function initGridIndex() {
    for (const ele of document.querySelectorAll(".grid")) {
        masonry = new Masonry(ele, {
            percentPosition: true,
            itemSelector: ".grid-item",
            columnWidth: ".grid-sizer",
        })
    }
    // masonryLayout()
    for (const ele of document.querySelectorAll(".grid-index-cover.height-animation")) {
        const imgE = ele as HTMLImageElement
        const imageLoadAnimator = new ImageLoadAnimator(imgE, -1, false, () => {
            postMasonryLayout()
        })
    }
}

let lastTimeout: NodeJS.Timeout = null
function postMasonryLayout() {
    if (lastTimeout != null) clearTimeout(lastTimeout)
    lastTimeout = setTimeout(() => {
        masonryLayout()
    }, 20)
}

export function masonryLayout() {
    if (masonry == null) return
    consoleDebug("Masonry layout")
    masonry.layout()
}

function initCardRipple() {
    for (const ele of document.querySelectorAll(".index-top-card,.grid-index-card__ripple")) {
        new MDCRipple(ele)
    }
}


