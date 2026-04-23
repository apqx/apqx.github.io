import { useEffect, useRef, useState } from "react"

interface size {
    width: number
    height: number
}

export function useDebouncedResize(target: HTMLElement, delay: number = 100): size {
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
            }, delay)
        })

        resizeObserver.observe(target)
        return () => {
            resizeObserver.disconnect()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [target, delay])

    return size
}