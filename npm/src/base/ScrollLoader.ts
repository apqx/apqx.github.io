export class ScrollLoader {
    timeMsIgnore: number
    load: () => void
    lastLoadTime: number = 0

    constructor(load: () => void, timeMsIgnore: number = 50) {
        this.load = load
        this.timeMsIgnore = timeMsIgnore
    }

    onScroll(clientHeight: number, scrollY: number, scrollHeight: number) {
        // consoleDebug("onScroll " + scrollY)
        // 距离底部小于组件高度时加载更多
        if (scrollHeight - scrollY - clientHeight < clientHeight) {
            if (Date.now() - this.lastLoadTime < this.timeMsIgnore) return
            this.load()
            this.lastLoadTime = Date.now()
        }
    }
}