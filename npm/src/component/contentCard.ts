// import "./contentCard.scss"
import { consoleDebug } from "../util/log"
import { toggleElementClass } from "../util/tools"
import { getWindowInterSectionObserver } from "./animation/BaseAnimation"

/**
 * 卡片默认是偏移和透明的，初始化卡片使其恢复到原位置和不透明
 * @param withAnimation 是否使用动画
 */
export function initContentCard(withAnimation: boolean) {
    const cardE = document.querySelector(".content-card")
    consoleDebug("Init content card " + cardE)
    if (cardE == null) {
        consoleDebug("Content card not found, skip init")
        return
    }
    if (withAnimation) {
        // 启动动画，卡片恢复到原位置和不透明度
        getWindowInterSectionObserver().observe(cardE!!)
    } else {
        // 不启动动画，删除使卡片偏移、透明的动画class
        toggleElementClass(cardE, "slide-in-farer", false)
    }
}
