import "./BaseDialog.scss"
import { consoleInfo } from "../../util/log"
import { MDCDialog } from "@material/dialog"
import React, { useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { setupButtonRipple } from "../button"
import { ScrollLoader } from "../../base/ScrollLoader"
import { toggleScrimActive } from "../scrim"
import { ScrollContext } from "../react/LoadingHint"
import { toggleElementClass } from "../../util/tools"

export interface ActionBtn {
    text: string,
    closeOnClick: boolean,
    onClick: ((e: React.MouseEvent<HTMLElement>) => void) | undefined
}

export interface BaseDialogOpenProps {
    openCounter: number
    closeCounter?: number
}

export interface BaseDialogProps extends BaseDialogOpenProps {
    fixedWidth?: boolean,
    closeOnClickOutside?: boolean,
    scrollToTopOnDialogOpen?: boolean,
    onLoadMore?: () => void,
    onDialogOpen?: () => void,
    onDialogOpening?: () => void,
    onDialogClose?: () => void,
    onDialogClosing?: () => void,
    actions?: ActionBtn[],
    children: React.ReactNode
}

const defaultActionBtn: ActionBtn = { text: "关闭", closeOnClick: true, onClick: () => { } }

export function BaseDialog({ openCounter = 0, closeCounter = 0, fixedWidth = false, closeOnClickOutside = true, scrollToTopOnDialogOpen = true,
    onLoadMore = undefined, onDialogOpen = undefined, onDialogOpening = undefined, onDialogClose = undefined, onDialogClosing = undefined, actions = [defaultActionBtn], children }: BaseDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const animaERef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const dialogContentRef = useRef<HTMLDivElement>(null)
    const dialogRef = useRef<MDCDialog>(null)
    const btnCloseRef = useRef<HTMLElement>(null)

    // 使用 ref 存储回调函数的最新引用，避免因函数引用变化导致 useEffect 重新执行
    const onDialogOpenRef = useRef(onDialogOpen)
    const onDialogOpeningRef = useRef(onDialogOpening)
    const onDialogCloseRef = useRef(onDialogClose)
    const onDialogClosingRef = useRef(onDialogClosing)
    const scrollToTopOnDialogOpenRef = useRef(scrollToTopOnDialogOpen)

    // 更新 ref 中的函数引用，这些引用会在初始化的监听器中使用
    useEffect(() => {
        onDialogOpenRef.current = onDialogOpen
        onDialogOpeningRef.current = onDialogOpening
        onDialogCloseRef.current = onDialogClose
        onDialogClosingRef.current = onDialogClosing
        scrollToTopOnDialogOpenRef.current = scrollToTopOnDialogOpen
    }, [onDialogOpen, onDialogOpening, onDialogClose, onDialogClosing, scrollToTopOnDialogOpen])

    useEffect(() => {
        consoleInfo("BaseDialog useEffect")
        const rootE = containerRef.current as Element
        dialogContentRef.current = rootE.querySelector("#basic-dialog-content") as HTMLDivElement

        rootE.querySelectorAll(".basic-dialog_btn_action").forEach((ele) => {
            if (ele.getAttribute("data-mdc-dialog-action") == "close") {
                btnCloseRef.current = ele as HTMLElement
            }
            setupButtonRipple(ele as HTMLElement)
        })

        const clearListeners = initDialog(rootE as HTMLElement)

        dialogRef.current!.open()

        return () => {
            consoleInfo("BaseDialog useEffect cleanup")

            clearListeners()
            dialogRef.current?.destroy()
        }

    }, [])

    // 监听 dialog 内部滚动，触发加载更多
    useEffect(() => {
        if (onLoadMore == null) return
        const scrollLoader = new ScrollLoader(() => {
            if (onLoadMore != null) {
                onLoadMore()
            }
        })
        const onScrollListener = () => {
            scrollLoader.onScroll(dialogContentRef.current!!.clientHeight, dialogContentRef.current!!.scrollTop, dialogContentRef.current!!.scrollHeight)
        }
        dialogContentRef.current!!.addEventListener("scroll", onScrollListener)

        return () => {
            dialogContentRef.current!!.removeEventListener("scroll", onScrollListener)
        }
    }, [onLoadMore])

    // 这里会在上一个 useEffect 中的 dialogRef.current 被赋值后执行，确保 closeOnClickOutside 的修改能生效
    useEffect(() => {
        if (dialogRef.current == null) return
        // 设置为空，点击 Dialog 外部，不取消
        dialogRef.current.scrimClickAction = closeOnClickOutside ? "close" : ""
    }, [closeOnClickOutside])

    useEffect(() => {
        consoleInfo("BaseDialog useEffect openCounter = " + openCounter)
        if (openCounter > 0) {
            dialogRef.current?.open()
        }
    }, [openCounter])

    useEffect(() => {
        consoleInfo("BaseDialog useEffect closeCounter = " + closeCounter)
        if (closeCounter > 0) {
            dialogRef.current?.close()
        }
    }, [closeCounter])

    function initDialog(rootE: HTMLElement) {
        dialogRef.current = new MDCDialog(rootE)

        rootE.addEventListener("transitionend", (event: TransitionEvent) => {
             const target = event.target as Element
             if (target != animaERef.current) return
             const currentTarget = event.currentTarget as Element
            //  consoleInfo("BaseDialog transitionend, target = " + target.className + ", currentTarget = " + currentTarget.className)
            //  关闭动画结束后，删除动画类
            if (currentTarget.classList.contains("mdc-dialog--my-closing")) {
                toggleElementClass(currentTarget, "mdc-dialog--my-closing", false)
            }
        })

        const onOpeningListener = () => {
            consoleInfo("Dialog opening")
            if (onDialogOpeningRef.current != null) {
                onDialogOpeningRef.current()
            }
            toggleScrimActive(true)
        }
        const onOpenedListener = () => {
            consoleInfo("Dialog opened")
            if (onDialogOpenRef.current != null) {
                onDialogOpenRef.current()
            }
            handleFocus()
            if (scrollToTopOnDialogOpenRef.current) {
                scrollToTop()
            }
        }

        const onClosingListener = () => {
            consoleInfo("Dialog closing")
            toggleElementClass(rootE, "mdc-dialog--my-closing", true)
            if (onDialogClosingRef.current != null) {
                onDialogClosingRef.current()
            }
            toggleScrimActive(false)
            if (onDialogCloseRef.current != null) {
                onDialogCloseRef.current()
            }
        }

        const onClosedListener = () => {
            consoleInfo("Dialog closed")
        }

        // 启动 open 动画
        dialogRef.current!.listen("MDCDialog:opening", onOpeningListener)
        // open 动画结束
        dialogRef.current!.listen("MDCDialog:opened", onOpenedListener)
        // 启动 close 动画
        dialogRef.current!.listen("MDCDialog:closing", onClosingListener)
        // close 动画结束
        dialogRef.current!.listen("MDCDialog:closed", onClosedListener)

        return (() => {
            dialogRef.current?.unlisten("MDCDialog:opening", onOpeningListener)
            dialogRef.current?.unlisten("MDCDialog:opened", onOpenedListener)
            dialogRef.current?.unlisten("MDCDialog:closing", onClosingListener)
            dialogRef.current?.unlisten("MDCDialog:closed", onClosedListener)
        })
    }

    function scrollToTop(smooth: boolean = true) {
        if (smooth) {
            dialogContentRef.current?.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            )
        } else {
            dialogContentRef.current?.scrollTo(
                {
                    top: 0,
                    behavior: "instant"
                }
            )
        }
    }

    function handleFocus() {
        if (btnCloseRef.current == null) return
        // Dialog 弹出时应该让 Button 获取焦点，避免 chip 出现选中阴影
        // 但是 Button 获取焦点后颜色会变化，所以立即取消焦点
        btnCloseRef.current.focus()
        btnCloseRef.current.blur()
    }

    return (
        <div ref={containerRef} className="mdc-dialog">
            <div ref={animaERef} className="mdc-dialog__container">
                <div
                    className={fixedWidth ? "mdc-dialog__surface mdc-dialog__fixed-width" : "mdc-dialog__surface"}
                    role="alertdialog" aria-modal="true"
                    aria-labelledby="basic-dialog-title"
                    aria-describedby="basic-dialog-content">
                    <ScrollContext.Provider value={scrollContainerRef}>
                        <div ref={scrollContainerRef} className="mdc-dialog__content mdc-theme--on-surface"
                            id="basic-dialog-content">
                            {children}
                        </div>
                    </ScrollContext.Provider>

                    {actions && actions.length > 0 &&
                        <div className="mdc-dialog__actions basic-dialog_actions">
                            {actions.map((btn, index) =>
                                <button type="button"
                                    className="mdc-button basic-dialog_btn_action"
                                    data-mdc-dialog-action={btn.closeOnClick ? "close" : ""}
                                    onClick={btn.onClick}
                                    tabIndex={0}>
                                    <span className="mdc-button__label"
                                    >{btn.text}</span>
                                </button>
                            )}
                        </div>
                    }
                </div>
            </div>
            <div className="mdc-dialog__scrim"></div>
        </div>
    )
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
let rootDialogMap = new Map<string, Root>()

export function showDialog(_contentElement: React.JSX.Element, _dialogWrapperId: string) {
    // 如果此时 html 还未加载完成，确实可能出现为 null 的情况
    if (document.readyState === "loading") return
    dialogContainerE = document.querySelector("#dialog_container")
    let root: Root | undefined
    if (rootDialogMap.has(_dialogWrapperId)) {
        root = rootDialogMap.get(_dialogWrapperId)
    } else {
        // 创建 wrapper 节点
        let rootE = document.createElement("div")
        rootE.setAttribute("id", _dialogWrapperId)
        dialogContainerE!!.appendChild(rootE)
        root = createRoot(rootE)
        // root 对应的 dialog 会在之后创建时添加
        rootDialogMap.set(_dialogWrapperId, root)
    }
    root?.render(_contentElement)
}
