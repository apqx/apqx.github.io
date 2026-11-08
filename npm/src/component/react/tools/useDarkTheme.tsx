import { useCallback, useMemo, useRef, useState } from "react";
import { isDarkThemeFromDocument, isDarkThemeFromSysAndUserSettings } from "../../theme";
import { consoleInfo } from "../../../util/log";
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter, type Events } from "../../base/EventBus";
import { DelayToTimeGap } from "../../base/DelayToTimeGap";

/**
 * 监听主题变化的 state，延迟 300 ms 修改状态，有的地方需要查询主题的 CSS 属性，延迟可以确保查询到正确的值
 */
export function useDarkTheme(): [boolean, () => void, () => void] {
    const mediaQueryRef = useRef<MediaQueryList>(window.matchMedia("(prefers-color-scheme: dark)"))
    const delayToTimeGap = useMemo(() => new DelayToTimeGap(), [])

    const [isDark, setIsDark] = useState(() => {
        return isDarkThemeFromDocument()
    })

    const setDarkTheme = useCallback((isDark: boolean) => {
        delayToTimeGap.delay(() => {
            setIsDark(isDark)
        })
    }, [delayToTimeGap])

    const themeChangeHandler = useCallback((data: Events["themeChange"]) => {
        consoleInfo("useDarkTheme receive themeChange event, theme = " + data.theme + ", showToast = " + data.showToast)
        const newIsDark = isDarkThemeFromSysAndUserSettings()
        setDarkTheme(newIsDark)
    }, [setDarkTheme])

    const mediaQueryChangeHandler = useCallback((e: MediaQueryListEvent) => {
        consoleInfo("useDarkTheme receive mediaQueryChange event, matches dark theme = " + e.matches)
        const newIsDark = isDarkThemeFromSysAndUserSettings()
        setDarkTheme(newIsDark)
    }, [setDarkTheme])

    const pageEventHandler = useCallback((data: Events["pageEvent"]) => {
        consoleInfo("useDarkTheme receive pageEvent, event = " + data)
        if (data == EVENT_PAGE_BACK_FROM_CACHE) {
            const newIsDark = isDarkThemeFromSysAndUserSettings()
            setDarkTheme(newIsDark)
        }
    }, [setDarkTheme])

    const startListening = useCallback(() => {
        consoleInfo("useDarkTheme startListening")
        setIsDark(isDarkThemeFromDocument())
        // 监听系统主题变化
        mediaQueryRef.current.addEventListener("change", mediaQueryChangeHandler)
        // 监听手动切换主题
        getEventEmitter().on("themeChange", themeChangeHandler)
        // 监听页面从缓存中加载事件，重新检查主题设置
        getEventEmitter().on("pageEvent", pageEventHandler)

    }, [themeChangeHandler, mediaQueryChangeHandler, pageEventHandler])

    const stopListening = useCallback(() => {
        consoleInfo("useDarkTheme stopListening")
        mediaQueryRef.current.removeEventListener("change", mediaQueryChangeHandler)
        getEventEmitter().off("themeChange", themeChangeHandler)
        getEventEmitter().off("pageEvent", pageEventHandler)
        delayToTimeGap.cancelPendingAction()
    }, [themeChangeHandler, mediaQueryChangeHandler, pageEventHandler, delayToTimeGap])

    return [isDark, startListening, stopListening]
}
