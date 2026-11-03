import { useEffect, useRef, useState, type RefObject } from "react"
import { isRefObject } from "../../../util/tools"

interface size {
    width: number
    height: number
}

interface useDebouncedResizeOptions {

    delay?: number
    resizeCallback?: () => void
}

const DEBOUNCE_DELAY = 100

export function useDebouncedResize(target: HTMLElement | RefObject<HTMLElement | null>, { delay = DEBOUNCE_DELAY, resizeCallback = undefined }: useDebouncedResizeOptions = {}): size {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [size, setSize] = useState<size>({
        width: 0,
        height: 0
    })

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                const entry = entries.pop()
                if (!entry) return
                if (isRefObject(target) && entry.target !== target.current) return
                if (!isRefObject(target) && entry.target !== target) return
                const newSize = {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                }
                setSize(prev => {
                    if (prev.width === newSize.width && prev.height === newSize.height) return prev;
                    return newSize;
                })
                if (resizeCallback) {
                    resizeCallback()
                }
            }, delay)
        })
        const element = isRefObject(target) ? target.current : target;
        resizeObserver.observe(element!)
        return () => {
            resizeObserver.disconnect()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [target, delay, resizeCallback])

    return size
}