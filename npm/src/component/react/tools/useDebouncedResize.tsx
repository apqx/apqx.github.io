import { useEffect, useRef, useState, type RefObject } from "react"
import { isRefObject } from "../../../util/tools"

interface size {
    width: number
    height: number
}

export const DEBOUNCE_DELAY = 100

export function useDebouncedResize(target: HTMLElement | RefObject<HTMLElement | null>, delay: number = DEBOUNCE_DELAY, resizeCallback: (() => void) | undefined = undefined): size {
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
                const entry = entries[0]
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