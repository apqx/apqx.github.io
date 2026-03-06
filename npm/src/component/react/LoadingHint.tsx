import "./LoadingHint.scss"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"
import { useEffect, useMemo, useRef } from "react"
import { consoleDebug } from "../../util/log"

export const LOADING_HINT_ERROR: string = "重试加载"
export const LOADING_HINT_NO_RESULT: string = "暂无数据"

interface Props {
    loading: boolean
    loadHint?: string
    onClickHint: () => void
    onLoadMore?: () => void
}

export function LoadingHint(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const onLoadMoreRef = useRef(props.onLoadMore)

    useEffect(() => {
        onLoadMoreRef.current = props.onLoadMore
    }, [props.onLoadMore])

    useEffect(() => {
        consoleDebug("LoadingHint useEffect window.innerHeight: " + window.innerHeight)
        let gap = window.innerHeight * 0.8
        const interSectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                consoleDebug("LoadingHint IntersectionObserver isIntersection: " + entry.isIntersecting)
                if (entry.isIntersecting) {
                    if (onLoadMoreRef.current) {
                        onLoadMoreRef.current()
                    }
                }
            })
        }, {
            threshold: 0,
            rootMargin: `0px 0px ${gap}px 0px`
        })

        if (containerRef.current) {
            interSectionObserver.observe(containerRef.current)
        }
        return () => {
            consoleDebug("LoadingHint useEffect cleanup")
            if (containerRef.current) {
                interSectionObserver.unobserve(containerRef.current)
            }
        }
        // 这里锚定 loading 状态，确保一次加载完成后触发 intersection 检测
    }, [props.loading, props.loadHint])

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