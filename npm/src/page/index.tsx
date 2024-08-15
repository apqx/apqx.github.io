// import "./index.scss"
import Masonry from "masonry-layout"
import { runOnHtmlDone, runOnPageDone } from "../util/tools"
import { consoleArrayDebug, consoleDebug, consoleError, consoleObjDebug } from "../util/log"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { IndexList } from "../component/react/IndexList"
import { getIndexType } from "../base"
import { POST_TYPE_ORIGINAL, POST_TYPE_OTHER, POST_TYPE_POETRY, POST_TYPE_REPOST } from "../base/constant"
import { ImageLoadAnimator } from "../component/animation/ImageLoadAnimator"
import { Post } from "../component/react/post/BasePostPaginateShow"
import { GridIndexList } from "../component/react/GridIndexList"
import { MDCRipple } from "@material/ripple"

runOnPageDone(() => {
    initIndexTopCover()
    initIndexList()
})

function initIndexList() {
    const wrapperE = document.querySelector("#index-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }

    const root = createRoot(wrapperE)
    const category = getIndexType(window.location.pathname).identifier
    consoleDebug("Index category = " + category + ", path = " + window.location.pathname)
    if (category == POST_TYPE_OTHER.identifier) return

    const onUpdate = () => {
        // 当react更新时，动画更新wrapper高度
        destroyMasonry()
    }
    if (category == POST_TYPE_ORIGINAL.identifier ||
        category == POST_TYPE_POETRY.identifier ||
        category == POST_TYPE_REPOST.identifier) {

        // 随笔、诗词、转载
        // 获取已有的post，包括置顶和非置顶
        const loadedPosts = getLinearLoadedPosts(wrapperE)
        consoleObjDebug("Index loaded posts", loadedPosts)
        root.render(<IndexList tag={""} category={category} pinedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
            onUpdate={onUpdate} />)
    } else {
        // 看剧
        // 显示Jekyll预加载数据，然后React去更新它，会更顺滑
        initMasonry()
        const descriptionE = document.querySelector(".grid-index-li--description")
        let descriptionHtml = ""
        if (descriptionE != null)
            descriptionHtml = descriptionE.innerHTML
        const loadedPosts = getGridLoadedPosts(wrapperE)
        consoleObjDebug("Index loaded posts", loadedPosts)
        root.render(<GridIndexList tag={""} category={category} pinedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
            onUpdate={onUpdate} pageDescriptionHtml={descriptionHtml} />)
    }
}

function getLinearLoadedPosts(wrapperE: HTMLElement): Array<Array<Post>> {
    const pinedPosts: Array<Post> = []
    const otherPosts: Array<Post> = []
    for (const liE of wrapperE.querySelectorAll(".index-li")) {
        const title = (liE.querySelector(".index-title") as HTMLElement).innerText
        const author = (liE.querySelector(".index-author") as HTMLElement).innerText
        const date = (liE.querySelector(".index-date") as HTMLElement).innerText
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const pin = liE.classList.contains("index-li--pin")
        const post = {
            title: title,
            author: author,
            actor: "",
            date: date,
            path: path,
            description: "",
            cover: "",
            coverAlt: "",
            pin: pin,
            hide: false
        }
        if (pin) {
            pinedPosts.push(post)
        } else {
            otherPosts.push(post)
        }
    }
    const array = new Array<Array<Post>>()
    array.push(pinedPosts)
    array.push(otherPosts)
    return array
}

function getGridLoadedPosts(wrapperE: HTMLElement): Array<Array<Post>> {
    const pinedPosts: Array<Post> = []
    const otherPosts: Array<Post> = []
    for (const liE of wrapperE.querySelectorAll(".grid-index-li:not(.grid-index-li--description)")) {
        const title = (liE.querySelector(".grid-index-title") as HTMLElement).innerText
        // actor和date放在一起了，因为两个span之间的距离，在原生和react中不一样
        // const actor = (liE.querySelector(".grid-index-author") as HTMLElement).innerText
        // const date = (liE.querySelector(".grid-index-date") as HTMLElement).innerText
        const dateAndActor = (liE.querySelector(".grid-index-date") as HTMLElement).innerText.match("(\\d{4}年\\d{2}月\\d{2}日) (.*)")
        let actor = dateAndActor[2]
        let date = dateAndActor[1]
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const description = (liE.querySelector(".grid-index-description") as HTMLElement).innerText
        const coverE = liE.querySelector(".grid-index-cover") as HTMLImageElement
        const cover = coverE.src
        const coverAlt = coverE.alt

        const pin = liE.classList.contains("grid-index-li--pin")
        const post = {
            title: title,
            author: "",
            actor: actor,
            date: date,
            path: path,
            description: description,
            cover: cover,
            coverAlt: coverAlt,
            pin: pin,
            hide: false
        }
        if (pin) {
            pinedPosts.push(post)
        } else {
            otherPosts.push(post)
        }
    }
    const array = new Array<Array<Post>>()
    array.push(pinedPosts)
    array.push(otherPosts)
    return array
}

const INDEX_TOP_COVER_RATIO = 844 / 295

/**
 * 初始化首页封面，监听下载状态，启动高度变化动画
 */
function initIndexTopCover() {
    for (const ele of document.querySelectorAll(".index-top-cover.height-animation")) {
        const imgE = ele as HTMLImageElement
        const imageLoadAnimator = new ImageLoadAnimator(imgE, INDEX_TOP_COVER_RATIO, true, null)
    }
    for (const ele of document.querySelectorAll(".index-top-card,.grid-index-card__ripple")) {
        new MDCRipple(ele)
    }
}

let masonry: Masonry = null

function initMasonry() {
    const gridE = document.querySelector(".grid")
    if (gridE == null) return
    masonry = new Masonry(gridE, {
        percentPosition: true,
        itemSelector: ".grid-item",
        columnWidth: ".grid-sizer",
    })
}

function destroyMasonry() {
    if (masonry != null) {
        masonry.destroy()
        masonry = null
    }
}