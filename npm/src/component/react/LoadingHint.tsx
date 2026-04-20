import "./LoadingHint.scss"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"
import { createContext, useContext, useEffect, useMemo, useRef } from "react"
import { consoleInfo, consoleInfoObj } from "../../util/log"

export const LOADING_HINT_ERROR: string = "重试加载"
export const LOADING_HINT_NO_RESULT: string = "暂无数据"

/**
 * 用于父级组件提供滚动容器的 Context，LoadingHint 组件会使用 IntersectionObserver 监听自身是否进入视口，从而触发加载更多的回调函数
 */
export const ScrollContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export const useScrollRoot = () => useContext(ScrollContext);

interface Props {
    loading: boolean
    loadHint?: string
    onClickHint: () => void
    onLoadMore?: () => void
    /**
     * 是否使用更长的 Intersection 判断距离，默认为 false
     */
    extendIntersectionThreshold?: boolean
}


export function LoadingHint(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const onLoadMoreRef = useRef(props.onLoadMore)
    const scrollRoot = useScrollRoot()

    useEffect(() => {
        onLoadMoreRef.current = props.onLoadMore
    }, [props.onLoadMore])

    useEffect(() => {
        let viewportHeight = window.innerHeight
        if (scrollRoot?.current) {
            viewportHeight = scrollRoot.current.clientHeight
        }
        let gap = props.extendIntersectionThreshold ? viewportHeight * 1.2 : viewportHeight * 0.8
        if (gap == 0) {
            gap = 400
        }
        consoleInfo("LoadingHint useEffect gap: " + gap)
        consoleInfoObj("LoadingHint useEffect scrollRoot:", scrollRoot?.current)
        const interSectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                consoleInfo("LoadingHint IntersectionObserver isIntersection: " + entry.isIntersecting)
                if (entry.isIntersecting) {
                    if (onLoadMoreRef.current) {
                        onLoadMoreRef.current()
                    }
                }
            })
        }, {
            root: scrollRoot?.current ?? null,
            threshold: 0,
            rootMargin: `0px 0px ${gap}px 0px`
        })

        if (containerRef.current) {
            interSectionObserver.observe(containerRef.current)
        }
        consoleInfo("LoadingHint useEffect loading: " + props.loading + ", loadHint: " + props.loadHint)
        return () => {
            consoleInfo("LoadingHint useEffect cleanup")
            if (containerRef.current) {
                interSectionObserver.unobserve(containerRef.current)
            }
        }
        // 这里锚定 loading 状态，确保一次加载完成后触发 intersection 检测
    }, [props.loading, props.loadHint, props.extendIntersectionThreshold])

    const hide = useMemo(() => {
        return !props.loading && props.loadHint == null
    }, [props.loading, props.loadHint])

    return (
        <div ref={containerRef} className={`loading-hint-wrapper center-inline-items ${hide ? "hide" : ""}`.trim()}>
            <ProgressCircular loading={props.loading} classes={props.loading ? ["show"] : []} />
            <Button text={props.loadHint ?? ""} onClick={props.loading ? undefined : props.onClickHint} tabIndex={-1}
                classes={!props.loading && props.loadHint != null ? ["show"] : []} />
        </div>
    )
}

export function getLoadHint(loadSize: number, resultSize: number): string | undefined {
    if (resultSize === 0) return LOADING_HINT_NO_RESULT
    if (loadSize >= resultSize) return undefined
    return loadSize + "/" + resultSize + " MORE"
}