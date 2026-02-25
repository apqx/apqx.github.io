import mitt, { type Emitter } from "mitt"

/**
 * 页面从缓存中加载事件，通常是用户点击浏览器的后退按钮或者前进按钮，导致页面从缓存中加载，而不是重新加载。
 * 这时需要通知页面组件刷新数据，以保证数据的正确性。
 */
export const EVENT_PAGE_BACK_FROM_CACHE = "pageBackFromCache"

export type Events = {
    pageEvent: string
    lensFilterChange: {
        selectedTags: string[]
    }
}


var emitter: Emitter<Events> | null = null

export function getEventEmitter() {
    if (emitter == null) {
        emitter = mitt<Events>()
    }
    return emitter
}