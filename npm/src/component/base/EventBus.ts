import mitt, { type Emitter } from "mitt"

/**
 * 页面从缓存中加载事件，通常是用户点击浏览器的后退按钮或者前进按钮，导致页面从缓存中加载，而不是重新加载。
 * 这时需要通知页面组件刷新数据，以保证数据的正确性。
 */
export const EVENT_PAGE_BACK_FROM_CACHE = "pageBackFromCache"

export type Events = {
    pageEvent: string
    // 当用户更改透镜的标签过滤条件时触发，通知透镜组件刷新照片列表
    lensFilterChange: {
        selectedTags: string[]
    }
    // 当用户更改透镜照片大图模式时的设置时触发，通知透镜组件刷新布局
    lensBiggerPictureChange: {
        enabled: boolean
    }
    // 通知 Footer 显示或隐藏
    footerDisplayChange: {
        enabled: boolean
    }
    // 当用户更改隐藏状态栏背景的设置时触发，通知页面组件刷新状态栏样式
    hideStatusBarBgChange: {
        enabled: boolean
    }
    // 当用户更改主题设置时触发，通知检查主题设置
    themeChange: {
        theme: string
    }
    // 当用户更改固定顶部栏设置时触发，通知顶部栏组件刷新布局
    topbarFixedChange: {
        fixed: boolean
    }
    // 当用户更改字体设置时触发，通知页面组件刷新字体
    fontChange: {
        notoSerifSCFont: boolean
    }
}


var emitter: Emitter<Events> | null = null

export function getEventEmitter() {
    if (emitter == null) {
        emitter = mitt<Events>()
    }
    return emitter
}