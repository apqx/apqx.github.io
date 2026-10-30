import "./SmoothCollapse.scss"
import { useLayoutEffect, useRef, type RefObject } from "react"
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
        let preHeight = targetERef.current.offsetHeight
        let preWidth = targetERef.current.offsetWidth
        consoleInfo("SmoothCollapse useEffect init height = " + preHeight + ", width = " + preWidth)
        const resizeObserver = new ResizeObserver((entries) => {
            // 当元素的上级被设置为 display: none 时，offsetHeight 会变为 0，过滤掉这种情况
            if (isElementHidden(monitorERef.current!)) return
            for (const entry of entries) {
                const ele = entry.target as HTMLElement
                var height = ele.offsetHeight
                var width = ele.offsetWidth
                // const duration = Math.max(calculateDuration(height, preHeight, "height"), calculateDuration(width, preWidth, "width"))
                consoleInfo("SmoothCollapse resizeObserver: height = " + height + ", maxHeight = " + maxHeight + ", preHeight = " + preHeight)
                if(maxHeight && maxHeight > 0 && height > maxHeight) {
                    height = maxHeight
                }
                const duration = calculateDuration(height, preHeight, "height")
                consoleInfo("SmoothCollapse calculateDuration = " + duration + "s")
                // calculateDuration(width, preWidth, "width")
                preHeight = height
                preWidth = width
                targetERef.current!.style.transitionDuration = duration + "s"
                if (frameIdRef.current !== null) {
                    cancelAnimationFrame(frameIdRef.current)
                }
                frameIdRef.current = requestAnimationFrame(() => {
                    frameIdRef.current = null
                    targetERef.current!.style.height = height + "px"
                    // wrapperE.parentElement!.style.width = width + "px"
                })
            }
        })
        resizeObserver.observe(monitorERef.current)

        return () => {
            consoleInfo("SmoothCollapse useEffect cleanup")
            resizeObserver.disconnect()
        }
    }, [targetERef.current, monitorERef.current ,maxHeight])
}

export function calculateDuration(newSize: number, preSize: number, propertyName: string): number {
    let duration = 0
    const animationSize = Math.abs(newSize - preSize)

    duration = animationSize / 1000
    consoleInfo(`SmoothCollapse wrapper ${propertyName} = ${preSize} -> ${newSize}, animationSize = ${animationSize}, duration = ${duration}s`)
    if (duration > 0 && duration < 0.35) {
        duration = 0.35
        consoleInfo(`SmoothCollapse actual duration = ${duration}s`)
    } else if (duration > 0.5) {
        duration = 0.5
        consoleInfo(`SmoothCollapse actual duration = ${duration}s`)
    }

    return duration
}

function isElementHidden(el: HTMLElement): boolean {
    // 注意：这个判断对 position: fixed 的元素在某些浏览器下会有例外
    // 但对于大多数布局场景，它是判断 display: none 的金标准
    return el.offsetParent === null && el.tagName !== 'BODY';
};