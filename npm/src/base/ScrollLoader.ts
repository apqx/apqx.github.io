import { consoleDebug } from "../util/log"

export class ScrollLoader {
    timeMsIgnore: number
    shouldLoad: () => void
    lastLoadTime: number
    constructor(shouldLoad: () => void, timeMsIgnore: number = 50) {
        this.shouldLoad = shouldLoad
        this.timeMsIgnore = timeMsIgnore
    }

    onScroll(clientHeight: number, scrollY: number, scrollHeight: number) {
        // consoleDebug("onScroll " + scrollY)
        if (scrollHeight - scrollY - clientHeight < clientHeight) {
            if (Date.now() - this.lastLoadTime < this.timeMsIgnore) return
            this.shouldLoad()
            this.lastLoadTime = Date.now()
        }
    }
}