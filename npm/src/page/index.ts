// import "./index.scss"
import Masonry from "masonry-layout";
import {MDCRipple} from "@material/ripple";
import {runOnHtmlDone, runOnPageDone} from "../util/tools";
import {consoleDebug} from "../util/log";

runOnPageDone(() => {
    initCardRipple()
    initGridIndex()
})

let masonry: Masonry = null

function initGridIndex() {
    for(const ele of document.querySelectorAll(".grid")) {
        masonry = new Masonry(ele, {
            percentPosition: true,
            itemSelector: ".grid-item",
            columnWidth: ".grid-sizer",
        })
    }

    for (const ele of document.getElementsByClassName("index-lazy-img")) {
        const imgE = ele as HTMLImageElement
        imgE.onload = (event) => {
            masonryLayout()
        }
    }
}

export function masonryLayout() {
    if (masonry == null) return
    masonry.layout()
}

function initCardRipple() {
    for (const ele of document.querySelectorAll(".index-card,.grid-index-card_ripple,.index-top-card")) {
        new MDCRipple(ele)
    }
}
