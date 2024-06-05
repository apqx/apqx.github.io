// import "./index.scss"
import Masonry from "masonry-layout"
import { MDCRipple } from "@material/ripple"
import { runOnHtmlDone, runOnPageDone } from "../util/tools"
import { consoleArrayDebug, consoleDebug, consoleError } from "../util/log"

runOnPageDone(() => {
    initCardRipple()
    initIndex()
    initGridIndex()
})

const INDEX_TOP_COVER_RATIO = 844 / 295

export let coverHeight = 0

function initIndex() {
    for (const ele of document.querySelectorAll(".index-top-cover.height-animation")) {
        const imgE = ele as HTMLImageElement
        // 图片有可能已经加载、显示完成
        if (imgE.complete) {
            consoleDebug("Cover complete " + getImgAlt(imgE) + ", " +
                imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
            setCoverHeight(imgE, INDEX_TOP_COVER_RATIO)
        } else {
            // 如何获取图片的原始尺寸
            // 懒加载完成监听
            imgE.onload = (event) => {
                consoleDebug("Cover onload " + getImgAlt(imgE) + ", " +
                    imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
                // 浏览器下载完成，尚未显示出来，尺寸height已经计算出来了
                setCoverHeight(imgE, INDEX_TOP_COVER_RATIO)
            }
            imgE.onerror = (event) => {
                setCoverHeight(imgE, INDEX_TOP_COVER_RATIO)
            }
        }
        let lastWidth = imgE.width
        // 监听宽度变化，实时设置高度
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries.pop()
            // consoleDebug("Cover size changed " + entry.contentRect.width + " : " + entry.contentRect.height)
            if (entry.contentRect.width == lastWidth) {
                // 宽度没有变化
                // consoleDebug("Cover width not change")
                return
            }
            lastWidth = entry.contentRect.width
            postSetCoverHeight(entry.target as HTMLImageElement, INDEX_TOP_COVER_RATIO)
        })
        resizeObserver.observe(imgE)
    }
}

function getImgAlt(ele: HTMLElement): string {
    return ele.attributes.getNamedItem("alt").value
}

let lastPostSetHeightId = null
function postSetCoverHeight(imgE: HTMLImageElement, ratio: number) {
    if (lastPostSetHeightId != null) {
        clearTimeout(lastPostSetHeightId)
    }
    lastPostSetHeightId = setTimeout(() => {
        setCoverHeight(imgE, ratio)
    }, 100)
}

function setCoverHeight(imgE: HTMLImageElement, ratio: number) {
    coverHeight = imgE.width / ratio
    consoleDebug("SetCoverHeight = " + coverHeight)
    imgE.style.height = coverHeight + "px"
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
        // 监听下载完成事件，获取图片尺寸，设置高度，触发动画
        // 动画完成后设置高度为auto，通知Masonry重新layout
        // 不必监听宽度变化，实时设置高度，Masonry自己会监听宽度变化重新layout
        imgE.addEventListener("transitionend", (event) => {
            consoleDebug("Cover transitionend " + getImgAlt(imgE))
            // 动画完成后，设置高度为auto，通知Masonry重新layout
            imgE.classList.remove("height-animation")
            imgE.style.height = "auto"
            postMasonryLayout()
        })
        if (imgE.complete) {
            consoleDebug("Cover complete " + getImgAlt(imgE) + ", " +
                imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
            setCoverHeight(imgE, imgE.naturalWidth / imgE.naturalHeight)
        } else {
            imgE.onload = (event) => {
                consoleDebug("Cover onload " + getImgAlt(imgE) + ", " +
                    imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
                setCoverHeight(imgE, imgE.naturalWidth / imgE.naturalHeight)
            }
            imgE.onerror = (event) => {
                // setCoverHeight(imgE)
            }
        }

    }
}

let lastPostMasonryLayoutId = null
function postMasonryLayout() {
    if (lastPostMasonryLayoutId != null) {
        clearTimeout(lastPostMasonryLayoutId)
    }
    lastPostMasonryLayoutId = setTimeout(() => {
        masonryLayout()
    }, 20)
}

export function masonryLayout() {
    if (masonry == null) return
    consoleDebug("Masonry layout")
    masonry.layout()
}

function initCardRipple() {
    for (const ele of document.querySelectorAll(".index-top-card,.index-card,.grid-index-card__ripple")) {
        new MDCRipple(ele)
    }
}
