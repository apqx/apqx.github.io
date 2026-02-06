import "./SmoothCollapse.scss"
import { useEffect, useRef } from "react"
import { consoleDebug } from "../../util/log"

type SmoothCollapseProps = {
    children: React.ReactNode
}
/**
 * 根据子元素高度平滑改变容器高度的组件
 */
export function SmoothCollapse({ children }: SmoothCollapseProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        consoleDebug("SmoothCollapse useEffect")
        const wrapperE = wrapperRef.current as HTMLElement
        let preHeight = wrapperE.offsetHeight
        const resizeObserver = new ResizeObserver((entries) => {
            // 当元素的上级被设置为 display: none 时，offsetHeight 会变为 0，过滤掉这种情况
            if (isElementHidden(wrapperE)) return
            for (const entry of entries) {
                const height = entry.contentRect.height
                const duration = calculateDuration(height, preHeight)
                preHeight = height
                wrapperE.parentElement!.style.transitionDuration = duration + "s"
                wrapperE.parentElement!.style.height = height + "px"
            }
        })
        resizeObserver.observe(wrapperE)

        return () => {
            consoleDebug("SmoothCollapse useEffect cleanup")
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <div className="smooth-collapse">
            <div ref={wrapperRef} className="smooth-collapse-wrapper">
                {children}
            </div>
        </div>
    )
}

function calculateDuration(height: number, preHeight: number) {
    let duration = 0
    const animationSize = Math.abs(height - preHeight)

    duration = animationSize / 1800
    consoleDebug("SmoothCollapse wrapper totalHeight = " + height + ", preHeight = " + preHeight +
        ", animationSize = " + animationSize + ", duration = " + duration + "s")
    if (duration < 0.3) {
        duration = 0.3
        consoleDebug("Actual duration = " + duration + "s")
    } else if (duration > 0.5) {
        duration = 0.5
        consoleDebug("Actual duration = " + duration + "s")
    }

    return duration
}

function isElementHidden(el: HTMLElement): boolean {
  // 注意：这个判断对 position: fixed 的元素在某些浏览器下会有例外
  // 但对于大多数布局场景，它是判断 display: none 的金标准
  return el.offsetParent === null && el.tagName !== 'BODY';
};