export class ScrollLoader {
    timeMsIgnore: number
    shouldLoad: () => void
    lastLoadTime: number = 0
    constructor(shouldLoad: () => void, timeMsIgnore: number = 50) {
        this.shouldLoad = shouldLoad
        this.timeMsIgnore = timeMsIgnore
    }

    onScroll(clientHeight: number, scrollY: number, scrollHeight: number) {
        // consoleDebug("onScroll " + scrollY)
        // 距离底部小于组件高度时加载更多
        if (scrollHeight - scrollY - clientHeight < clientHeight) {
            if (Date.now() - this.lastLoadTime < this.timeMsIgnore) return
            this.shouldLoad()
            this.lastLoadTime = Date.now()
        }
    }
}