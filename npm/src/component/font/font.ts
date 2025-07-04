import { localRepository } from "../../repository/LocalRepository"
import { toggleClassWithEnable } from "../../util/tools"
import { consoleError } from "../../util/log"
import React from "react"

/**
 * 初始化主字体
 * TODO：支持思源宋体
 */
export function initFont() {
    // 废弃handwritten设置，TODO: 注意旧版本可能启用了这个设置项
    // const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    // setHandwrittenFont(localHandWritingFontOn)
    // TODO: 之后应使用字体设置项，而非boolean
    // const localNotoSerifSCFontOn = localRepository.getNotoSerifSCFontOn()
    // setNotoSerifSCFont(localNotoSerifSCFontOn)
    // setNotoSerifSCFont(true)
    checkFont()
}

export function setHandwrittenFont(on: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, "font-handwritten", on)
    checkFont()
}

export function setNotoSerifSCFont(on: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, "font-noto-serif-sc", on)
    checkFont()
}

export function checkFont() {
    // 主字体：思源宋体
    const notoSerifSCElements = document.querySelectorAll(".font-noto-serif-sc")
    if (notoSerifSCElements.length > 0) {
        import("./fontMainNotoSerifSC").then().catch((e) => {
            consoleError("Load notoSerifSC font error: " + e)
        })
    }
    // 主字体：兰亭题序国风行楷
    const handwrittenElements = document.querySelectorAll(".font-handwritten")
    if (handwrittenElements.length > 0)
        import("./fontHandwritten").then().catch((e) => {
            consoleError("Load handwritten font error: " + e)
        })
    // 默认主字体：霞鹜文楷，默认加载资源
    // if (document.querySelectorAll("body.font-noto-serif-sc").length <= 0 && document.querySelectorAll("body.font-handwritten").length <= 0) {
    //     import("./fontMainXLWK").then().catch((e) => {
    //         consoleError("Load fontMainXLWK font error: " + e)
    //     })
    // }
    // 索引页封面手写体
    const handwrittenIndexElements = document.querySelectorAll(".font-handwritten-index")
    if (handwrittenIndexElements.length > 0)
        import("./fontHandwrittenIndex").then().catch((e) => {
            consoleError("Load handwrittenIndex font error: " + e)
        })
    // 代码字体：霞鹜文楷Mono
    const codeElements = document.querySelectorAll("pre code")
    if (codeElements.length > 0)
        import("./fontCode").then().catch((e) => {
            consoleError("Load code font error: " + e)
        })
}