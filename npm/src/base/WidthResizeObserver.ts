import { consoleDebug } from "../util/log"

export class WidthResizeObserver {
    callback: (width: number) => void
    lastTimeout: NodeJS.Timeout = null
    lastWidth = -1
    resizeObserver = new ResizeObserver((entries) => {
        const entry = entries.pop()
        if (entry.contentRect.width == this.lastWidth) {
            // 宽度没有变化
            // consoleDebug("Cover width not change")
            return
        }
        this.lastWidth = entry.contentRect.width
        if (this.lastTimeout != null) {
            clearTimeout(this.lastTimeout)
        }
        this.lastTimeout = setTimeout(() => {
            consoleDebug("WidthResizeObserver width changed after delay " + entry.contentRect.width)
            this.callback(entry.contentRect.width)
        }, 100)
    })
    constructor(e: HTMLElement, callback: (width: number) => void) {
        this.lastWidth = e.clientWidth
        this.callback = callback
        this.resizeObserver.observe(e)
    }

    destroy() {
        this.resizeObserver.disconnect()
    }
}