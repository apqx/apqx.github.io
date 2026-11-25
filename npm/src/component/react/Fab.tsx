import { useCallback, useEffect, useRef } from "react"
import { IconButton, type IconButtonProps } from "./Button"
import "./Fab.scss"
import { FadeAnimationController } from "../animation/FadeAnimationController"
import type { IAnimationController } from "../animation/IAnimationController"
import { DelayToTimeGap } from "../base/DelayToTimeGap"
import { getSectionTypeByPath, isIndexPage, SECTION_TYPE_LENS } from "../../base/constant"
import { createRoot, type Root } from "react-dom/client"
import { showLensFilterDialog } from "../dialog/LensFilterDialog"

export interface FabProps {
    btns?: IconButtonProps[]
    hint?: string
}

export function Fab(props: FabProps) {
    const hintRef = useRef<HTMLDivElement>(null)
    const hintAnimControllerRef = useRef<IAnimationController | null>(null)
    const hintDelayRef = useRef<DelayToTimeGap | null>(null)

    useEffect(() => {
        return () => {
            hintDelayRef.current?.cancelPendingAction()
            hintAnimControllerRef.current?.destroy()
        }
    }, [])

    useEffect(() => {
        if (hintDelayRef.current == null) {
            hintDelayRef.current = new DelayToTimeGap(500)
        }
        if (hintAnimControllerRef.current == null && hintRef.current) {
            hintAnimControllerRef.current = new FadeAnimationController(hintRef.current as HTMLElement)
        }
        if (props.hint) {
            hintAnimControllerRef.current?.toggleOpen(true)
            hintDelayRef.current.delay(() => {
                hintAnimControllerRef.current?.toggleOpen(false)
            })
        }
        void props.hint
    }, [props.hint])

    const onClickScrollToTop = useCallback(() => {
        scrollToTopNative()
    }, [])

    return (
        // 使用 button 而不是 a 标签，添加 ripple 的 a 在 safari 中必须等动画播放完成才会触发 click 事件，存在明显延迟。
        <div className="fab-container">
            <div ref={hintRef} className="fab-hint-wrapper fade">
                <div className="fab-item-hint">
                    <span>{props.hint}</span>
                </div>
            </div>
            <div className="fab-item-wrapper">
                <IconButton icon={"arrow_upward"} onClick={onClickScrollToTop} tabIndex={0} bounded={true} />
                {
                    props.btns?.map((it) =>
                        <IconButton key={it.icon} icon={it.icon} onClick={it.onClick} tabIndex={it.tabIndex} bounded={true} />
                    )
                }
            </div>
        </div>
    )
}

/**
 * 使用原生平滑滚动，但 smooth 在 2022 年的 iOS safari 15.4 中才开始支持
 */
export function scrollToTopNative(smooth: boolean = true) {
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "instant" })
}

let root: Root | null
let btns: IconButtonProps[] | undefined

export function initFab() {
    const url = document.location.pathname
    const isIndex = isIndexPage(url)
    const section = getSectionTypeByPath(url)

    if (btns == null) {
        btns = []
        if (isIndex && section.identifier == SECTION_TYPE_LENS.identifier) {
            btns.push({
                icon: "image_search",
                onClick: () => { showLensFilterDialog() },
                tabIndex: 0
            })
        }
    }

    // 如果此时 html 还未加载完成，确实可能出现为 null 的情况
    if (document.readyState === "loading") return
    if (root == null) {
        const fabContainerE = document.querySelector("#fab_container")
        if (fabContainerE == null) return
        root = createRoot(fabContainerE!)
        root.render(<Fab btns={btns} />)
    }
}

export function showFabHints(hint: string) {
    if (root == null) {
        initFab()
    }
    root?.render(<Fab btns={btns} hint={hint} />)
}