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

function initIndex() {
    for (const ele of document.querySelectorAll(".index-top-cover.height-animation")) {
        const imgE = ele as HTMLImageElement
        consoleDebug("Find cover " + imgE.width + " : " + imgE.height)
        // 图片有可能已经加载、显示完成
        if (imgE.complete) {
            setCoverHeight(imgE)
        } else {
            // 懒加载完成监听
            imgE.onload = (event) => {
                // 浏览器下载完成，尚未显示出来，尺寸height已经计算出来了
                setCoverHeight(imgE)
            }
            imgE.onerror = (event) => {
                setCoverHeight(imgE)
            }
        }
        let lastWidth = imgE.width
        // 监听宽度变化，实时设置高度
        const resizeObserver = new ResizeObserver((entries) => {
            consoleArrayDebug("Cover size changed ", entries)
            const entry = entries.pop()
            if (entry.contentRect.width == lastWidth) {
                // 宽度没有变化
                return
            }
            lastWidth = entry.contentRect.width
            setCoverHeight(entry.target as HTMLImageElement)
        })
        resizeObserver.observe(imgE)
    }
}

function setCoverHeight(imgE: HTMLImageElement) {
    const wh = 844 / 295
    const height = imgE.width / wh
    consoleDebug("SetCoverHeight = " + height)
    imgE.style.height = height + "px"
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

    masonryLayout()
    for (const ele of document.querySelectorAll(".grid-index-cover")) {
        const imgE = ele as HTMLImageElement
        imgE.onload = (event) => {
            consoleDebug("Cover loaded, height = " + imgE.height)
            masonryLayout()
        }
    }
    // 动画可以使用第三方懒加载库，监听下载完成事件，获取图片尺寸，设置高度
    // 监听宽度变化，实时设置高度
    // 监听动画完成，刷新layout
}

export function masonryLayout() {
    if (masonry == null) return
    masonry.layout()
}

function initCardRipple() {
    for (const ele of document.querySelectorAll(".index-top-card,.index-card,.grid-index-card__ripple")) {
        new MDCRipple(ele)
    }
}
