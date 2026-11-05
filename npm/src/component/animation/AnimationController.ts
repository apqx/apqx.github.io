import { consoleInfo } from "../../util/log"
import { elementContainsClass, toggleElementClass } from "../../util/tools"
import type { IAnimationController } from "./IAnimationController"

const OPENING_CLASS_SUFFIX = "--opening"
const OPEN_CLASS_SUFFIX = "--open"
const CLOSING_CLASS_SUFFIX = "--closing"
const PRESERVE_DISPLAY_NONE_CLASS_SUFFIX = "-preserve-display-none"

export class AnimationController implements IAnimationController {
    private element: HTMLElement | null
    private baseClass: string
    private openingClass: string
    private openClass: string
    private closingClass: string
    private preserveDisplayNone: string
    private transitionEndListener: (event: TransitionEvent) => void

    private frameId: number | null = null

    constructor(element: HTMLElement, baseClass: string)

    constructor(element: HTMLElement, baseClass: string, openingClass: string, openClass: string, closingClass: string, preserveDisplayNone: string)

    constructor(element: HTMLElement, baseClass: string, openingClass?: string, openClass?: string, closingClass?: string, preserveDisplayNone?: string) {
        this.element = element
        this.baseClass = baseClass
        if (openingClass == null) {
            this.openingClass = baseClass + OPENING_CLASS_SUFFIX
            this.openClass = baseClass + OPEN_CLASS_SUFFIX
            this.closingClass = baseClass + CLOSING_CLASS_SUFFIX
            this.preserveDisplayNone = baseClass + PRESERVE_DISPLAY_NONE_CLASS_SUFFIX
        } else {
            this.openingClass = openingClass
            this.openClass = openClass ?? baseClass + OPEN_CLASS_SUFFIX
            this.closingClass = closingClass ?? baseClass + CLOSING_CLASS_SUFFIX
            this.preserveDisplayNone = preserveDisplayNone ?? baseClass + PRESERVE_DISPLAY_NONE_CLASS_SUFFIX
        }
        consoleInfo(`AnimationController init ${this.baseClass} ${this.openingClass} ${this.openClass} ${this.closingClass} ${this.preserveDisplayNone}`)

        this.transitionEndListener = (event: TransitionEvent) => {
            if(this.element == null) return
            const target = event.target as HTMLElement
            consoleInfo("AnimationController transitionEnd before " + target.tagName + " : " + target.classList)
            if (target != this.element || !elementContainsClass(target, this.baseClass)) return
            // 动画结束时，应只有两种状态，删除中间的过渡 class
            // baseClass + openClass
            // baseClass
            if (elementContainsClass(target, this.openingClass)) {
                toggleElementClass(target, this.openingClass, false)
                toggleElementClass(target, this.openClass, true)
            } else if (elementContainsClass(target, this.closingClass)) {
                toggleElementClass(target, this.openClass, false)
                // 具有 preserveDisplayNone 的元素动画结束时保留 closing，避免变成 base 的 display: none
                if (!elementContainsClass(this.element, this.preserveDisplayNone)) {
                    toggleElementClass(target, this.closingClass, false)
                }
            }
            consoleInfo("AnimationController transitionEnd after " + target.tagName + " : " + target.classList)
            this.stopListenTransition()
        }
    }

    private delayToNextFrame(callback: () => void) {
        this.frameId = requestAnimationFrame(() => {
            this.frameId = requestAnimationFrame(() => {
                callback()
            })
        })
    }

    getElement(): Element | null {
        return this.element
    }

    toggleOpen(open: boolean) {
        if(this.element == null) return
        consoleInfo(`AnimationController toggleOpen ${open}, classList : ${this.element.classList}`)
        cancelPendingShowFrame(this.frameId)
        // transition 动画可以中断，当前可能处于的状态有
        // baseClass + openingClass
        // baseClass + openingClass + openClass
        // baseClass + openClass
        // baseClass + openClass + closingClass
        // baseClass
        if (open) {
            toggleElementClass(this.element, this.closingClass, false)
            if (elementContainsClass(this.element, this.openClass)) {
                // 可能是 opening open 或 open，无需操作
            } else {
                toggleElementClass(this.element, this.openingClass, true)
                this.delayToNextFrame(() => {
                    consoleInfo("AnimationController add " + this.openClass)
                    // 监听动画完成
                    this.startListenTransition()
                    toggleElementClass(this.element, this.openClass, true)
                })
            }
        } else {
            if (elementContainsClass(this.element, this.preserveDisplayNone) 
                && elementContainsClass(this.element, this.openingClass)
                && !elementContainsClass(this.element, this.openClass)
            ) {
                consoleInfo("AnimationController preserve display none, do nothing")
                return
            }

            toggleElementClass(this.element, this.openingClass, false)
            if (elementContainsClass(this.element, this.openClass)) {
                this.startListenTransition()
                toggleElementClass(this.element, this.closingClass, true)
                toggleElementClass(this.element, this.openClass, false)
            } else {
                // 不包含 open，已经去除 opening，无需操作
            }
        }
    }

    private startListenTransition() {
        if (this.element == null) return
        this.element.addEventListener("transitionend", this.transitionEndListener)
    }
    
    private stopListenTransition() {
        if (this.element == null) return
        this.element.removeEventListener("transitionend", this.transitionEndListener)
    }

    destroy() {
        this.stopListenTransition()
        this.element = null
    }

}

function cancelPendingShowFrame(frameId: number | null) {
    if (frameId != null) {
        cancelAnimationFrame(frameId)
    }
}