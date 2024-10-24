import { localRepository } from "../../repository/LocalRepository"
import { toggleClassWithEnable } from "../../util/tools"
import { consoleError } from "../../util/log"

/**
 * 初始化主字体
 * TODO：支持思源宋体
 */
export function initHandwritingFont() {
    const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    setHandwrittenFont(localHandWritingFontOn)
}

export function setHandwrittenFont(on: boolean) {
    const bodyE = document.querySelector("body");
    toggleClassWithEnable(bodyE, "handwritten", on)
    checkHandwrittenFont()
}

/**
 * 按需加载手写字体
 */
export function checkHandwrittenFont() {
    const handwrittenElements = document.querySelectorAll(".handwritten")
    if (handwrittenElements.length > 0)
        import("./fontHandwritten").then().catch((e) => {
            consoleError("Load handwritten font error: " + e)
        })
}

/**
 * 按需加载索引页的手写字体
 */
export function checkHandwrittenIndexFont() {
    const handwrittenElements = document.querySelectorAll(".handwritten-index")
    if (handwrittenElements.length > 0)
        import("./fontHandwrittenIndex").then().catch((e) => {
            consoleError("Load handwrittenIndex font error: " + e)
        })
}

/**
 * 按需加载代码字体
 */
export function checkCodeFont() {
    const handwrittenElements = document.querySelectorAll("pre code")
    if (handwrittenElements.length > 0)
        import("./fontCode").then().catch((e) => {
            consoleError("Load code font error: " + e)
        })
}