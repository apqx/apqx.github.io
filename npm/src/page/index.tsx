import "./index.scss"
import { runOnHtmlDone, toggleClassWithEnable } from "../util/tools"
import { consoleDebug, consoleObjDebug } from "../util/log"
import { createRoot } from "react-dom/client"
import { IndexList } from "../component/react/IndexList"
import { getSectionTypeByPath, SECTION_TYPE_OTHER } from "../base/constant"
import { ImageLoadAnimator } from "../component/animation/ImageLoadAnimator"
import { GridIndexList } from "../component/react/GridIndexList"
import { LensIndexList } from "../component/react/LensIndexList"
import type { Post } from "../component/react/post/PostPaginateShowPresenter"
import { setupCardRipple } from "../component/card"

export function initIndex() {
    runOnHtmlDone(() => {
        initIndexList()
    })
}

function initIndexList() {
    const wrapperE = document.querySelector("#index-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }

    const root = createRoot(wrapperE)
    const category = getSectionTypeByPath(window.location.pathname).identifier
    consoleDebug("Index category = " + category + ", path = " + window.location.pathname)
    if (category == SECTION_TYPE_OTHER.identifier) return

    if (wrapperE.classList.contains("index-list-wrapper")) {
        // 随笔、诗词、转载
        // 获取已有的post，包括置顶和非置顶
        const loadedPosts = getLinearLoadedPosts(wrapperE)
        consoleObjDebug("Index loaded posts", loadedPosts)
        root.render(<IndexList tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
            onMount={() => { initIndexTopCover() }} onUpdate={() => { }} />)
    } else if (wrapperE.classList.contains("grid-index-list-wrapper")) {
        // 看剧
        const descriptionE = document.querySelector(".grid-index-li--description")
        let descriptionHtml = ""
        if (descriptionE != null)
            descriptionHtml = descriptionE.innerHTML
        const loadedPosts = getGridLoadedPosts(wrapperE)
        consoleObjDebug("Index loaded posts", loadedPosts)
        root.render(<GridIndexList tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
            onMount={() => { }} onUpdate={() => { }} pageDescriptionHtml={descriptionHtml} />)
    } else if (wrapperE.classList.contains("lens-index-list-wrapper")) {
        // 透镜
        const loadedPosts = getLensLoadedPosts(wrapperE)
        consoleObjDebug("Lens Index loaded posts", loadedPosts)
        root.render(<LensIndexList tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
            onMount={() => { }} onUpdate={() => { }} />)
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
        const pinned = liE.querySelector(".index-pinned-icon-container") != null
        const featured = liE.querySelector(".index-featured-icon-container") != null
        const post = {
            title: title,
            author: author,
            actor: [],
            date: date,
            mention: [],
            location: "",
            path: path,
            description: "",
            cover: "",
            coverAlt: "",
            pinned: pinned,
            featured: featured,
            hidden: false
        }
        if (pinned) {
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

function getLensLoadedPosts(wrapperE: HTMLElement): Array<Array<Post>> {
    // 读取置顶和预置
    const pinedPosts: Array<Post> = []
    const otherPosts: Array<Post> = []
    for (const liE of wrapperE.querySelectorAll(".grid-index-li")) {
        // 202010｜王文惠 王恒涛
        const dateActorE = liE.querySelector(".lens-index-date") as HTMLElement
        const dateActor = dateActorE.innerText.trim().split("｜")
        const date = dateActor[0].trim()
        const fullDate = dateActorE.getAttribute("full-date") || "2000年01月01日"
        const actors = dateActor[1].trim().split(" ")
        const coverE = liE.querySelector(".grid-index-cover") as HTMLImageElement
        const cover = coverE?.src
        const coverAlt = coverE?.alt
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const pinned = liE.querySelector(".lens-index-pinned-icon-container") != null
        const featured = liE.querySelector(".lens-index-featured-icon-container") != null
        const post = {
            title: dateActor.join("｜"),
            author: "",
            actor: actors,
            mention: [],
            location: "",
            date: fullDate,
            path: path,
            description: "",
            cover: cover,
            coverAlt: coverAlt,
            pinned: pinned,
            featured: featured,
            hidden: false
        }
        if (pinned) {
            pinedPosts.push(post)
        } else {
            otherPosts.push(post)
        }
    }
    return [pinedPosts, otherPosts]
}

function getGridLoadedPosts(wrapperE: HTMLElement): Array<Array<Post>> {
    const pinedPosts: Array<Post> = []
    const otherPosts: Array<Post> = []
    for (const liE of wrapperE.querySelectorAll(".grid-index-li:not(.grid-index-li--description)")) {
        const title = (liE.querySelector(".grid-index-title") as HTMLElement).innerText
        const actor = (liE.querySelector(".grid-index-author") as HTMLElement).innerText.split(" ")
        const date = (liE.querySelector(".grid-index-date") as HTMLElement).innerText.trim()
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const description = (liE.querySelector(".grid-index-description") as HTMLElement).innerText
        const coverE = liE.querySelector(".grid-index-cover") as HTMLImageElement
        const cover = coverE?.src
        const coverAlt = coverE?.alt

        const pinned = liE.querySelector(".index-pinned-icon-container") != null
        const featured = liE.querySelector(".index-featured-icon-container") != null
        const post = {
            title: title,
            author: "",
            actor: actor,
            mention: [],
            location: "",
            date: date,
            path: path,
            description: description,
            cover: cover,
            coverAlt: coverAlt,
            pinned: pinned,
            featured: featured,
            hidden: false
        }
        if (pinned) {
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
    // 顶部卡片，透明度动画
    for (const ele of document.querySelectorAll(".index-top-card.card-fade-in")) {
        toggleClassWithEnable(ele, "card-fade-in-start", true)
    }
    // 顶部封面图片，高度动画
    for (const ele of document.querySelectorAll(".index-top-cover.image-height-animation")) {
        const imgE = ele as HTMLImageElement
        new ImageLoadAnimator(imgE, INDEX_TOP_COVER_RATIO, true,
            () => {
                // 仅在用户未滚动时的第一页执行动画，否则是不可见的无需动画
                return window.scrollY <= 0
            },
            () => {
                // 动画完成回调
            })
    }
    // 索引卡片
    for (const ele of document.querySelectorAll(".index-top-card,.grid-index-card__ripple")) {
        setupCardRipple(ele)
    }
}