import { consoleInfo } from "../../util/log"
import { elementContainsClass, toggleElementClass } from "../../util/tools"
import { DelayToNextFrame } from "../base/DelayToNextFrame"
import type { AnimEvent, IAnimationController } from "./IAnimationController"

const OPENING_CLASS_SUFFIX = "--opening"
const OPEN_CLASS_SUFFIX = "--open"
const CLOSING_CLASS_SUFFIX = "--closing"
const PRESERVE_DISPLAY_NONE_CLASS_SUFFIX = "-preserve-display-none"

enum State {
    Opening, Open, Closing, Close
}

export class AnimationController implements IAnimationController {
    private delayToNextFrame: DelayToNextFrame

    private element: HTMLElement | null
    private baseClass: string
    private openingClass: string
    private openClass: string
    private closingClass: string
    private preserveDisplayNone: string
    private transitionEndListener: (event: TransitionEvent) => void
    private eventListeners: Map<AnimEvent, Set<() => void>> = new Map()

    private state: State = State.Close

    constructor(element: HTMLElement | null, baseClass: string)

    constructor(element: HTMLElement | null, baseClass: string, openingClass: string, openClass: string, closingClass: string, preserveDisplayNone: string)

    constructor(element: HTMLElement | null, baseClass: string, openingClass?: string, openClass?: string, closingClass?: string, preserveDisplayNone?: string) {
        this.delayToNextFrame = new DelayToNextFrame()
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
            if (this.element == null) return
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

    fireEvent(event: AnimEvent) {
        consoleInfo(`AnimationController fireEvent ${event}`)
        const set = this.eventListeners.get(event)
        if (set) {
            set.forEach((callback) => {
                callback()
            })
        }
    }

    getElement(): Element | null {
        return this.element
    }

    addEventListener(event: AnimEvent, callback: () => void): void {
        let set = this.eventListeners.get(event)
        if (set) {
            set.add(callback)
        } else {
            set = new Set()
            set.add(callback)
            this.eventListeners.set(event, set)
        }
    }

    removeEventListener(event: AnimEvent, callback: () => void): void {
        const set = this.eventListeners.get(event)
        if (set) {
            set.delete(callback)
        }
    }

    isOpened(): boolean {
        // const result = elementContainsClass(this.element, this.openClass)
        //     && !elementContainsClass(this.element, this.openingClass)
        //     && !elementContainsClass(this.element, this.closingClass)
        const result = this.state == State.Open

        consoleInfo(`AnimationController isOpened = ${result}, state = ${this.state}, classes = ${this.element?.classList}`)
        return result
    }

    toggleOpen(open: boolean) {
        if (this.element == null) return
        consoleInfo(`AnimationController toggleOpen ${open}, classList : ${this.element.classList}`)
        this.delayToNextFrame.cancelPendingAction()
        // transition 动画可以中断，当前可能处于的状态有
        // 开启
        // baseClass + openingClass
        // baseClass + openingClass + openClass
        // baseClass + openClass
        // 关闭
        // baseClass + openClass closingClass
        // baseClass + closingClass
        // baseClass
        if (open) {
            if (elementContainsClass(this.element, this.openClass)) {
                // 可能是 opening open, open, open closing
                this.delayToNextFrame.cancelPendingAction()
                if (elementContainsClass(this.element, this.closingClass)) {
                    this.startListenTransition()
                    toggleElementClass(this.element, this.closingClass, false)
                    toggleElementClass(this.element, this.openingClass, true)
                } 
                this.state = State.Open
            } else {
                // 可能是 opening, closing
                this.state = State.Opening
                toggleElementClass(this.element, this.closingClass, false)
                toggleElementClass(this.element, this.openingClass, true)
                this.delayToNextFrame.delay(() => {
                    consoleInfo("AnimationController add " + this.openClass)
                    // 监听动画完成
                    this.startListenTransition()
                    toggleElementClass(this.element, this.openClass, true)
                    this.state = State.Open
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
            if (elementContainsClass(this.element, this.openClass)) {
                // 可能是 opening open, open, open closing
                this.state = State.Closing
                this.delayToNextFrame.delay(() => {
                    this.startListenTransition()
                    toggleElementClass(this.element, this.openingClass, false)
                    toggleElementClass(this.element, this.closingClass, true)
                    toggleElementClass(this.element, this.openClass, false)
                    this.state = State.Close
                })
            } else {
                // 可能是 opening, closing
                this.delayToNextFrame.cancelPendingAction()
                if (elementContainsClass(this.element, this.openingClass)) {
                    toggleElementClass(this.element, this.openingClass, false)
                }
                this.state = State.Close
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
        this.delayToNextFrame.cancelPendingAction()
        this.stopListenTransition()
        this.element = null
    }

}