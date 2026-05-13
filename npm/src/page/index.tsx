import "./index.scss"
import { parseImageSize, runOnHtmlDone } from "../util/tools"
import { consoleInfo, consoleInfoObj } from "../util/log"
import { createRoot } from "react-dom/client"
import { IndexLinearPosts } from "../component/react/IndexLinearPosts"
import { getSectionTypeByPath, SECTION_TYPE_OTHER } from "../base/constant"
import { IndexGridLens } from "../component/react/IndexGridLens"
import type { Post } from "../component/base/paginate/bean/Post"
import { IndexGridPosts } from "../component/react/IndexGridPosts"
import { StrictMode } from "react"

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
    const onMount = () => {
        // getEventEmitter().emit("footerDisplayChange", {
        //     enabled: true
        // })
    }

    const root = createRoot(wrapperE)
    const category = getSectionTypeByPath(window.location.pathname).identifier
    consoleInfo("Index category = " + category + ", path = " + window.location.pathname)
    if (category == SECTION_TYPE_OTHER.identifier) return

    if (wrapperE.classList.contains("index-list-wrapper")) {
        // 随笔、诗词、转载
        const cover = getLinearLoadedCover(wrapperE)
        // 获取已有 post，包括置顶和非置顶
        const loadedPosts = getLinearLoadedPosts(wrapperE)
        consoleInfoObj("Index loaded local posts", loadedPosts)
        root.render(
            <StrictMode>
                <IndexLinearPosts pageCover={cover?.cover} pageCoverDescription={cover?.coverDescription} pageTitle={cover?.pageTitle}
                    tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
                    onMount={onMount} />
            </StrictMode>
        )
    } else if (wrapperE.classList.contains("grid-index-list-wrapper")) {
        // 看剧
        // 读取描述，为 card 的内容
        const descriptionE = document.querySelector(".grid-index-li--description .grid-index-card")
        let descriptionHtml = ""
        if (descriptionE != null)
            descriptionHtml = descriptionE.innerHTML
        const loadedPosts = getGridLoadedPosts(wrapperE)
        consoleInfoObj("Index loaded local posts", loadedPosts)
        root.render(
            <StrictMode>
                <IndexGridPosts tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
                    onMount={onMount} pageDescriptionHtml={descriptionHtml} />
            </StrictMode>
        )
    } else if (wrapperE.classList.contains("lens-index-list-wrapper")) {
        // 透镜
        const loadedPosts = getLensLoadedPosts(wrapperE)
        consoleInfoObj("Index loaded local posts", loadedPosts)
        root.render(
            <StrictMode>
                <IndexGridLens tag={""} category={category} pinnedPosts={loadedPosts[0]} loadedPosts={loadedPosts[1]}
                    onMount={onMount} />
            </StrictMode>
        )
    }
}

function getLinearLoadedCover(wrapperE: HTMLElement) {
    const coverE = wrapperE.querySelector(".index-top-cover") as HTMLImageElement
    if (coverE != null) {
        const cover = coverE.src
        const coverDescription = coverE.alt
        const pageTitleE = wrapperE.querySelector(".index-top-card-text") as HTMLElement
        const pageTitle = pageTitleE?.innerText || ""
        return { cover, coverDescription, pageTitle }
    }
    return null
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
            date: date,
            moreDate: "",
            path: path,
            author: author,
            actors: [],
            mentions: [],
            location: "",
            description: "",
            cover: "",
            coverForIndex: "",
            coverAlt: "",
            tags: [],
            category: "",
            pinned: pinned,
            featured: featured,
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
        const coverSizeAttr = coverE?.getAttribute("imageSize")
        const coverSize = parseImageSize(coverSizeAttr)
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const pinned = liE.querySelector(".lens-index-pinned-icon-container") != null
        const featured = liE.querySelector(".lens-index-featured-icon-container") != null
        const post = {
            title: dateActor.join("｜"),
            date: fullDate,
            moreDate: "",
            path: path,
            author: "",
            actors: actors,
            mentions: [],
            location: "",
            description: "",
            cover: cover,
            coverForIndex: "",
            coverAlt: coverAlt,
            coverSize: coverSize,
            tags: [],
            category: "",
            pinned: pinned,
            featured: featured,
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
        const actors = (liE.querySelector(".grid-index-author") as HTMLElement).innerText.split(" ")
        const date = (liE.querySelector(".grid-index-date") as HTMLElement).innerText.trim()
        const path = (liE.querySelector(".index-a") as HTMLAnchorElement).pathname
        const description = (liE.querySelector(".grid-index-description") as HTMLElement).innerText
        const coverE = liE.querySelector(".grid-index-cover") as HTMLImageElement
        const cover = coverE?.src
        const coverAlt = coverE?.alt
        const coverSizeAttr = coverE?.getAttribute("imageSize")
        const coverSize = parseImageSize(coverSizeAttr)
        // TODO: 暂不支持置顶和精选
        const pinned = liE.querySelector(".index-pinned-icon-container") != null
        const featured = liE.querySelector(".index-featured-icon-container") != null
        const post = {
            title: title,
            date: date,
            moreDate: "",
            path: path,
            author: "",
            actors: actors,
            mentions: [],
            location: "",
            description: description,
            cover: cover,
            coverForIndex: "",
            coverAlt: coverAlt,
            coverSize: coverSize,
            tags: [],
            category: "",
            pinned: pinned,
            featured: featured,
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