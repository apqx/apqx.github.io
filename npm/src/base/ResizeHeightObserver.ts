import { consoleDebug } from "../util/log"

export class ResizeHeightObserver {
    callback: (width: number) => void
    lastTimeout: NodeJS.Timeout | null = null
    lastHeight = -1
    resizeObserver = new ResizeObserver((entries) => {
        // 只取最后一个，理论上应该只有一个
        const entry = entries.pop()
        if (entry!!.contentRect.height == this.lastHeight) {
            // 高度没有变化
            return
        }
        this.lastHeight = entry!!.contentRect.height
        if (this.lastTimeout != null) {
            clearTimeout(this.lastTimeout)
        }
        this.lastTimeout = setTimeout(() => {
            consoleDebug("ResizeHeightObserver height changed after delay " + entry!!.contentRect.height)
            this.callback(entry!!.contentRect.height)
        }, 200)
    })
    constructor(e: HTMLElement, callback: (height: number) => void) {
        this.lastHeight = e.clientHeight
        this.callback = callback
        this.resizeObserver.observe(e)
    }

    destroy() {
        this.resizeObserver.disconnect()
    }
}