import { useCallback, useEffect, useRef, useState } from "react";
import { isDarkThemeFromDocument, isDarkThemeFromSysAndUserSettings } from "../../theme";
import { consoleInfo } from "../../../util/log";
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter, type Events } from "../../base/EventBus";

/**
 * 监听主题变化的 state，延迟 300 ms 修改状态，有的地方需要查询主题的 CSS 属性，延迟可以确保查询到正确的值
 */
export function useDarkTheme(refreshCount: number): [boolean, () => void] {
    const delay = 300
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const mediaQueryRef = useRef<MediaQueryList>(window.matchMedia("(prefers-color-scheme: dark)"))

    const [isDark, setIsDark] = useState(() => {
        return isDarkThemeFromDocument()
    })

    function setState(isDark: boolean) {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            setIsDark(isDark)
        }, delay)
    }

    const themeChangeHandler = useCallback((data: Events["themeChange"]) => {
        consoleInfo("useDarkTheme receive themeChange event, theme = " + data.theme + ", showToast = " + data.showToast)
        const newIsDark = isDarkThemeFromSysAndUserSettings()
        setState(newIsDark)
    }, [])

    const mediaQueryChangeHandler = useCallback((e: MediaQueryListEvent) => {
        consoleInfo("useDarkTheme receive mediaQueryChange event, matches dark theme = " + e.matches)
        const newIsDark = isDarkThemeFromSysAndUserSettings()
        setState(newIsDark)
    }, [])

    const pageEventHandler = useCallback((data: Events["pageEvent"]) => {
        consoleInfo("useDarkTheme receive pageEvent, event = " + data)
        if (data == EVENT_PAGE_BACK_FROM_CACHE) {
            const newIsDark = isDarkThemeFromSysAndUserSettings()
            setState(newIsDark)
        }
    }, [])

    const stopListening = useCallback(() => {
        consoleInfo("useDarkTheme stopListening")
        mediaQueryRef.current.removeEventListener("change", mediaQueryChangeHandler)
        getEventEmitter().off("themeChange", themeChangeHandler)
        getEventEmitter().off("pageEvent", pageEventHandler)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
    }, [themeChangeHandler, mediaQueryChangeHandler, pageEventHandler])

    useEffect(() => {
        consoleInfo("useDarkTheme startListening")
        setIsDark(isDarkThemeFromDocument())
        // 监听系统主题变化
        mediaQueryRef.current.addEventListener("change", mediaQueryChangeHandler)
        // 监听手动切换主题
        getEventEmitter().on("themeChange", themeChangeHandler)
        // 监听页面从缓存中加载事件，重新检查主题设置
        getEventEmitter().on("pageEvent", pageEventHandler)

        return () => {
            stopListening()
        }
    }, [refreshCount])

    return [isDark, stopListening]
}

