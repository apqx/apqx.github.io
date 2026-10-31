import "./SmoothCollapse.scss"
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react"
import { consoleInfo } from "../../util/log"

type SmoothCollapseProps = {
    children: React.ReactNode
}

/**
 * 根据子元素高度平滑改变容器高度的组件，监听 wrapper 高度变化，计算出容器的高度变化差值，配合动画平滑过渡
 */
export function SmoothCollapse({ children }: SmoothCollapseProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    useResizeMonitor(parentRef, wrapperRef)

    return (
        <div ref={parentRef} className="smooth-collapse">
            <div ref={wrapperRef} className="smooth-collapse-wrapper">
                {children}
            </div>
        </div>
    )
}

export function useResizeMonitor(targetERef: RefObject<HTMLElement | null>, monitorERef: RefObject<HTMLElement | null>, maxHeight?: number) {
    const frameIdRef = useRef<number | null>(null)

    useLayoutEffect(() => {
        if (targetERef.current == null || monitorERef.current == null) return
        const resizeObserver = new ResizeObserver((entries) => {
            // 当元素的上级被设置为 display: none 时，ResizeObserver 会被触发, offsetHeight 会变为 0，过滤掉这种情况
            if (isElementHidden(monitorERef.current!)) return
            if (targetERef.current == null || monitorERef.current == null) return
            // 内部尺寸变化时，获取 target 的当前尺寸，然后计算与新尺寸的差值
            let currentHeight = targetERef.current.offsetHeight
            let currentWidth = targetERef.current.offsetWidth
            consoleInfo("SmoothCollapse resizeObserver currentHeight = " + currentHeight + ", currentWidth = " + currentWidth)
            for (const entry of entries) {
                const ele = entry.target as HTMLElement
                var newHeight = ele.offsetHeight
                consoleInfo("SmoothCollapse resizeObserver: newHeight = " + newHeight + ", maxHeight = " + maxHeight)
                if (maxHeight && maxHeight > 0 && newHeight > maxHeight) {
                    newHeight = maxHeight
                }
                const duration = calculateDuration(newHeight, currentHeight, "height")
                consoleInfo("SmoothCollapse calculateDuration = " + duration + "s")
                targetERef.current!.style.transitionDuration = duration + "s"
                if (frameIdRef.current !== null) {
                    cancelAnimationFrame(frameIdRef.current)
                }
                frameIdRef.current = requestAnimationFrame(() => {
                    frameIdRef.current = null
                    targetERef.current!.style.height = newHeight + "px"
                })
            }
        })
        resizeObserver.observe(monitorERef.current)

        return () => {
            consoleInfo("SmoothCollapse useEffect cleanup")
            resizeObserver.disconnect()
        }
    }, [targetERef.current, monitorERef.current, maxHeight])
}

export function calculateDuration(newSize: number, preSize: number, propertyName: string): number {
    let duration = 0
    const animationSize = Math.abs(newSize - preSize)

    duration = animationSize / 1400
    consoleInfo(`SmoothCollapse wrapper ${propertyName} = ${preSize} -> ${newSize}, animationSize = ${animationSize}, duration = ${duration}s`)
    if (duration > 0 && duration < 0.35) {
        duration = 0.35
        consoleInfo(`SmoothCollapse actual duration = ${duration}s`)
    } else if (duration > 0.55) {
        duration = 0.55
        consoleInfo(`SmoothCollapse actual duration = ${duration}s`)
    }

    return duration
}

export function isElementHidden(el: HTMLElement): boolean {
    // 注意：这个判断对 position: fixed 的元素在某些浏览器下会有例外
    // 但对于大多数布局场景，它是判断 display: none 的金标准
    return el.offsetParent === null && el.tagName !== 'BODY';
}