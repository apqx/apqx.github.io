import "./BaseDialog.scss"
import { consoleInfo } from "../../util/log"
import type React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { ScrollContext } from "../react/LoadingHint"
import { getResolvedElementMaxHeight, toggleElementClass } from "../../util/tools"
import { Scrim, type ScrimController } from "../react/Scrim"
import { useDebouncedResize } from "../react/tools/useDebouncedResize"
import { useDebouncedResizeMonitor } from "../react/SmoothCollapse"
import { Button } from "../react/Button"
import type { IAnimationController } from "../animation/IAnimationController"
import { AnimationController } from "../animation/AnimationController"
import { DelayToNextFrame } from "../base/DelayToNextFrame"

export interface ActionBtn {
    text: string,
    closeOnClick: boolean,
    onClick?: (() => void)
}

export interface BaseDialogOpenProps {
    dialogControllerRef?: DialogControllerRef
}

export interface DialogControllerRef {
    current: BaseDialogController | null
}

export interface BaseDialogController {
    opened: () => boolean
    open: () => void
    close: () => void
}

export interface BaseDialogProps extends BaseDialogOpenProps {
    fixedWidth?: boolean,
    closeOnClickOutside?: boolean,
    scrollToTopOnDialogOpen?: boolean,
    onDialogOpen?: () => void,
    onDialogClose?: () => void,
    actions?: ActionBtn[],
    children: React.ReactNode
}

export const defaultActionBtnClose: ActionBtn = { text: "关闭", closeOnClick: true, onClick: () => { } }

export function BaseDialog({ dialogControllerRef = undefined, fixedWidth = false, closeOnClickOutside = true, scrollToTopOnDialogOpen = true,
    onDialogOpen = undefined, onDialogClose = undefined, actions = [defaultActionBtnClose], children }: BaseDialogProps) {
    const [contentMaxHeight, setContentMaxHeight] = useState(0)

    const dialogRef = useRef<HTMLDivElement>(null)
    const dialogContainerFoFlexRef = useRef<HTMLDivElement>(null)
    const dialogSurfaceRef = useRef<HTMLDivElement>(null)
    const smoothCollapseWrapperRef = useRef<HTMLDivElement>(null)
    const scrimControllerRef = useRef<ScrimController | null>(null)
    const calcHeightContainerRef = useRef<HTMLDivElement>(null)

    const animationControllerRef = useRef<IAnimationController | null>(null)
    const delayToNextFrameRef = useRef<DelayToNextFrame>(new DelayToNextFrame())

    // 这两个会频繁变化
    const onDialogOpenRef = useRef<() => void>(onDialogOpen)
    const onDialogCloseRef = useRef<() => void>(onDialogOpen)
    const scrollToTopOnDialogOpenRef = useRef<boolean>(scrollToTopOnDialogOpen)

    useEffect(() => {
        onDialogOpenRef.current = onDialogOpen
        onDialogCloseRef.current = onDialogClose
        scrollToTopOnDialogOpenRef.current = scrollToTopOnDialogOpen
    }, [onDialogOpen, onDialogClose, scrollToTopOnDialogOpen])

    const toggleOpen = useCallback((open: boolean) => {
        if (open == animationControllerRef.current?.isOpened()) return
        animationControllerRef.current?.toggleOpen(open)
        if (open) {
            toggleElementClass(document.body, "mdm-dialog-scroll-lock", true)
            scrimControllerRef.current?.open()
        } else {
            scrimControllerRef.current?.close()
            toggleElementClass(document.body, "mdm-dialog-scroll-lock", false)
        }
        delayToNextFrameRef.current.delay(() => {
            if (open) {
                consoleInfo("BaseDialog onDialogOpened")
                onDialogOpenRef.current?.()
                if (scrollToTopOnDialogOpenRef.current) {
                    scrollToTop(true, calcHeightContainerRef.current)
                }
            } else {
                consoleInfo("BaseDialog onDialogClosed")
                onDialogCloseRef.current?.()
            }
        })
        return () => {
            delayToNextFrameRef.current.cancelPendingFrame()
        }
    }, [])

    useEffect(() => {
        consoleInfo("BaseDialog useEffect")
        animationControllerRef.current = new AnimationController(dialogRef.current, "dialog-slide")
        return () => {
            consoleInfo("BaseDialog useEffect cleanup")
            animationControllerRef.current?.destroy()
        }
    }, [])

    // 首次加载时打开 dialog，toggleOpen 不变，所以这里不会重复执行
    useEffect(() => {
        toggleOpen(true)
    }, [toggleOpen])

    // 向外传递控制器
    useEffect(() => {
        if (dialogControllerRef) {
            dialogControllerRef.current = {
                opened: () => {
                    return animationControllerRef.current?.isOpened() ?? false
                },
                open: () => toggleOpen(true),
                close: () => toggleOpen(false)
            }
        }
        return () => {
            if (dialogControllerRef) {
                dialogControllerRef.current = null
            }
        }
    }, [dialogControllerRef, toggleOpen])

    const onScrimClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!closeOnClickOutside) return
        // 点击命中 container，不算 outside
        // e.target 指向点击命中的最深层元素，即实际命中的元素
        if (dialogContainerFoFlexRef.current != e.target) return
        toggleOpen(false)
    }, [closeOnClickOutside, toggleOpen])

    const calcContentMaxHeight = useCallback(() => {
        // TODO: 这里计算的 maxHeight 不对，且缺少 inset 尺寸
        // surfaceHeight = contentHeight + actionHeight
        const surfaceMaxHeight = getResolvedElementMaxHeight(dialogSurfaceRef.current!) ?? 0
        const actionsE = dialogRef.current?.querySelector(".mdm-dialog__actions") as HTMLDivElement | null
        const actionBtnHeight = actionsE?.offsetHeight ?? 0
        consoleInfo(`Dialog surfaceMaxHeight = ${surfaceMaxHeight}, actionBtnHeight = ${actionBtnHeight}`)
        return surfaceMaxHeight - actionBtnHeight
    }, [])

    // Dialog 启动时由内容自动撑开 Dialog 至最大高度，然后监听内容高度变化，平滑过渡🤔

    useLayoutEffect(() => {
        setContentMaxHeight(calcContentMaxHeight())
    }, [calcContentMaxHeight])

    const resizeCallback = useCallback(() => {
        // 元素 display: none 时会触发 ResizeObserver，获取尺寸为 0，过滤这种情况 
        // if (isElementHidden(dialogContainerRef.current!)) return
        setContentMaxHeight(pre => {
            const current = calcContentMaxHeight()
            if (current == 0) return pre
            consoleInfo("Dialog contentMaxHeight changed: " + pre + " -> " + current)
            return current
        })
    }, [calcContentMaxHeight])

    // 监听视口尺寸变化，计算 surface 最大高度
    useDebouncedResize(dialogRef, { resizeCallback: resizeCallback })

    // 监听内容高度变化，使 Dialog 窗口平滑变化
    useDebouncedResizeMonitor(calcHeightContainerRef, smoothCollapseWrapperRef, contentMaxHeight)

    return (
        <>
            <div ref={dialogRef} className="mdm-dialog dialog-slide">
                <div ref={dialogContainerFoFlexRef} className="mdm-dialog-container-for-flex" onClick={onScrimClick}>
                    {/* 空元素获取焦点 */}
                    <div tabIndex={0}></div>
                    <div ref={dialogSurfaceRef} className={fixedWidth ? "mdm-dialog__surface mdm-dialog-fixed-width" : "mdm-dialog__surface"}>
                        <ScrollContext.Provider value={calcHeightContainerRef}>
                            <div ref={calcHeightContainerRef} className="mdm-dialog__content"
                                id="basic-dialog-content">
                                <div ref={smoothCollapseWrapperRef} className="smooth-collapse-wrapper">
                                    {children}
                                </div>
                            </div>
                        </ScrollContext.Provider>
                        {actions && actions.length > 0 &&
                            <div className="mdm-dialog__actions">
                                {actions.map((btn, _index) =>
                                    <Button key={btn.text} text={btn.text} onClick={() => {
                                        btn.onClick?.()
                                        if (btn.closeOnClick) {
                                            toggleOpen(false)
                                        }
                                    }} />
                                )}
                            </div>
                        }
                    </div>
                </div>
            </div>
            <Scrim controllerRef={scrimControllerRef} />
        </>

    )
}

function _handleFocus(ele: HTMLElement | null) {
    if (!ele) return
    // Dialog 弹出时应该让 Button 获取焦点，避免 chip 出现选中阴影
    // 但是 Button 获取焦点后颜色会变化，所以立即取消焦点
    ele.focus()
    ele.blur()
}

function scrollToTop(smooth: boolean = true, ele: HTMLElement | null) {
    if (!ele) return
    if (smooth) {
        ele.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        )
    } else {
        ele.scrollTo(
            {
                top: 0,
                behavior: "instant"
            }
        )
    }
}

export const COMMON_DIALOG_WRAPPER_ID = "common-dialog-wrapper"
export const TAG_DIALOG_WRAPPER_ID = "tag-dialog-wrapper"
export const SEARCH_DIALOG_WRAPPER_ID = "search-dialog-wrapper"
export const ABOUT_DIALOG_WRAPPER_ID = "about-dialog-wrapper"
export const INFO_DIALOG_WRAPPER_ID = "info-dialog-wrapper"
export const SHARE_DIALOG_WRAPPER_ID = "share-dialog-wrapper"
export const PREFERENCE_DIALOG_WRAPPER_ID = "preference-dialog-wrapper"
export const MATERIAL_DIALOG_WRAPPER_ID = "material-dialog-wrapper"
export const LENS_FILTER_DIALOG_WRAPPER_ID = "lens-filter-dialog-wrapper"
export const AUTH_DIALOG_WRAPPER_ID = "auth-dialog-wrapper"

// 缓存每种 dialog 的 root 容器
// 每个 tag 都使用单独的 dialog
let dialogContainerE: HTMLElement | null = null
const rootDialogMap = new Map<string, Root>()
// 存储每个 dialog 的 controller，key 是 dialogWrapperId 或者 tag
const dialogControllerMap = new Map<string, DialogControllerRef>()

export function getDialogController(dialogWrapperId: string): DialogControllerRef {
    if (dialogControllerMap.has(dialogWrapperId)) {
        return dialogControllerMap.get(dialogWrapperId)!!
    } else {
        const controllerRef = {
            current: null
        } as DialogControllerRef
        dialogControllerMap.set(dialogWrapperId, controllerRef)
        return controllerRef
    }
}

export function showDialog(_contentElement: React.JSX.Element, _dialogWrapperId: string) {
    // 如果此时 html 还未加载完成，确实可能出现为 null 的情况
    if (document.readyState === "loading") return
    dialogContainerE = document.querySelector("#dialog_container")
    let root: Root | undefined
    if (rootDialogMap.has(_dialogWrapperId)) {
        root = rootDialogMap.get(_dialogWrapperId)
    } else {
        // 创建 wrapper 节点
        const rootE = document.createElement("div")
        rootE.setAttribute("id", _dialogWrapperId)
        dialogContainerE!!.appendChild(rootE)
        root = createRoot(rootE)
        // root 对应的 dialog 会在之后创建时添加
        rootDialogMap.set(_dialogWrapperId, root)
    }
    root?.render(_contentElement)
}