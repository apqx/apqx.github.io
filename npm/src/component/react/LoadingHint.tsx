import "./LoadingHint.scss"
import { Button } from "./Button"
import { ProgressCircular } from "./ProgressCircular"
import { useEffect, useMemo, useRef } from "react"
import { consoleDebug } from "../../util/log"

export const ERROR_HINT: string = "重试加载"

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
            if (containerRef.current) {
                interSectionObserver.unobserve(containerRef.current)
            }
        }
        // 必要时这里可以锚定 loading 状态增加触发 intersection 事件的几率
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
    if (loadSize >= resultSize) return undefined
    return loadSize + "/" + resultSize + " MORE"
}

