import mitt, { type Emitter } from "mitt"

/**
 * 页面从缓存中加载事件，通常是用户点击浏览器的后退按钮或者前进按钮，导致页面从缓存中加载，而不是重新加载。
 * 这时需要通知页面组件刷新数据，以保证数据的正确性。
 */
export const EVENT_PAGE_BACK_FROM_CACHE = "pageBackFromCache"

export type Events = {
    pageEvent: string
    // 通知透镜组件刷新照片列表，当用户更改透镜的标签过滤条件时发出
    applyLensFilterChange: {
        selectedTags: string[]
    }
    // 通知透镜组件刷新布局，当用户更改透镜照片大图模式时的设置时发出
    applyLensBiggerPictureChange: {
        enabled: boolean
    }
    // 通知 Footer 显示或隐藏，外部控制 Footer 显示状态时发出
    applyFooterDisplayChange: {
        enabled: boolean
    }
    // 通知页面组件应用新状态栏样式，当用户更改隐藏状态栏背景的设置时发出
    applyStatusBarBgChange: {
        enabled: boolean
    }
    // theme 组件通知外部已经应用新主题
    themeChanged: null
    // 通知 theme 组件调整配色应用新主题，由触发主题变化的 toggle btn 或 preference 配置更改发出
    applyNewTheme: {
        theme: string,
        showToast: boolean
    }
    // 通知顶部栏组件应用新设置，当用户更改固定顶部栏设置时发出，
    applyTopbarFixedChange: {
        fixed: boolean
    }
    // 通知页面组件应用新字体，当用户更改字体设置时发出
    applyFontChange: {
        notoSerifSCFont: boolean
    }
}


let emitter: Emitter<Events> | null = null

export function getEventEmitter() {
    if (emitter == null) {
        emitter = mitt<Events>()
    }
    return emitter
}