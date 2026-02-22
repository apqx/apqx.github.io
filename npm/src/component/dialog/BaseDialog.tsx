import "./BaseDialog.scss"
import { consoleDebug } from "../../util/log"
import { MDCDialog } from "@material/dialog"
import React, { useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { setupButtonRipple } from "../button"
import { ScrollLoader } from "../../base/ScrollLoader"
import { toggleScrimActive } from "../scrim"

export interface ActionBtn {
    text: string,
    closeOnClick: boolean,
    onClick: ((e: React.MouseEvent<HTMLElement>) => void) | undefined
}

export interface BaseDialogOpenProps {
    openCount: number
}

export interface BaseDialogProps extends BaseDialogOpenProps {
    fixedWidth?: boolean,
    closeOnClickOutside?: boolean,
    scrollToTopOnDialogOpen?: boolean,
    onLoadMore?: () => void,
    onDialogOpen?: () => void,
    onDialogClose?: () => void,
    actions?: ActionBtn[],
    children: React.ReactNode
}

const defaultActionBtn: ActionBtn = { text: "关闭", closeOnClick: true, onClick: () => { } }

export function BaseDialog({ openCount, fixedWidth = false, closeOnClickOutside = true, scrollToTopOnDialogOpen = true,
    onLoadMore = undefined, onDialogOpen = undefined, onDialogClose = undefined, actions = [defaultActionBtn], children }: BaseDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const dialogContentRef = useRef<HTMLDivElement>(null)
    const dialogRef = useRef<MDCDialog>(null)
    const btnCloseRef = useRef<HTMLElement>(null)

    // 使用 ref 存储回调函数的最新引用，避免因函数引用变化导致 useEffect 重新执行
    const onLoadMoreRef = useRef(onLoadMore)
    const onDialogOpenRef = useRef(onDialogOpen)
    const onDialogCloseRef = useRef(onDialogClose)
    const scrollToTopOnDialogOpenRef = useRef(scrollToTopOnDialogOpen)

    // 更新 ref 中的函数引用，这些引用会在初始化的监听器中使用
    useEffect(() => {
        onLoadMoreRef.current = onLoadMore
        onDialogOpenRef.current = onDialogOpen
        onDialogCloseRef.current = onDialogClose
        scrollToTopOnDialogOpenRef.current = scrollToTopOnDialogOpen
    }, [onLoadMore, onDialogOpen, onDialogClose, scrollToTopOnDialogOpen])

    useEffect(() => {
        consoleDebug("BaseDialog useEffect")
        const rootE = containerRef.current as Element
        dialogContentRef.current = rootE.querySelector("#basic-dialog-content") as HTMLDivElement

        rootE.querySelectorAll(".basic-dialog_btn_action").forEach((ele) => {
            if (ele.getAttribute("data-mdc-dialog-action") == "close") {
                btnCloseRef.current = ele as HTMLElement
            }
            setupButtonRipple(ele as HTMLElement)
        })

        const clearListeners = initDialog(rootE)

        const scrollLoader = new ScrollLoader(() => {
            if (onLoadMoreRef.current != null) {
                onLoadMoreRef.current()
            }
        })
        const onScrollListener = () => {
            scrollLoader.onScroll(dialogContentRef.current!!.clientHeight, dialogContentRef.current!!.scrollTop, dialogContentRef.current!!.scrollHeight)
        }
        dialogContentRef.current!!.addEventListener("scroll", onScrollListener)

        dialogRef.current!.open()

        return () => {
            consoleDebug("BaseDialog useEffect cleanup")
            dialogContentRef.current!!.removeEventListener("scroll", onScrollListener)
            clearListeners()
            dialogRef.current?.destroy()
        }

    }, [])

    // 这里会在上一个 useEffect 中的 dialogRef.current 被赋值后执行，确保 closeOnClickOutside 的修改能生效
    useEffect(() => {
        if (dialogRef.current == null) return
        // 设置为空，点击 Dialog 外部，不取消
        dialogRef.current.scrimClickAction = closeOnClickOutside ? "close" : ""
    }, [closeOnClickOutside])

    useEffect(() => {
        consoleDebug("BaseDialog useEffect openCount = " + openCount)
        if (openCount > 0) {
            dialogRef.current?.open()
        }
    }, [openCount])

    function initDialog(rootE: Element) {
        dialogRef.current = new MDCDialog(rootE)

        const onOpeningListener = () => {
            consoleDebug("Dialog opening")
            toggleScrimActive(true)
        }
        const onOpenedListener = () => {
            consoleDebug("Dialog opened")
            if (onDialogOpenRef.current != null) {
                onDialogOpenRef.current()
            }
            handleFocus()
            if (scrollToTopOnDialogOpenRef.current) {
                scrollToTop()
            }
        }

        const onClosingListener = () => {
            consoleDebug("Dialog closing")
            toggleScrimActive(false)
            if (onDialogCloseRef.current != null) {
                onDialogCloseRef.current()
            }
        }

        const onClosedListener = () => {
            consoleDebug("Dialog closed")
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
            <div className="mdc-dialog__container">
                <div
                    className={fixedWidth ? "mdc-dialog__surface mdc-dialog__fixed-width" : "mdc-dialog__surface"}
                    role="alertdialog" aria-modal="true"
                    aria-labelledby="basic-dialog-title"
                    aria-describedby="basic-dialog-content">
                    <div className="mdc-dialog__content mdc-theme--on-surface"
                        id="basic-dialog-content">
                        {children}
                    </div>
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
export const SHARE_DIALOG_WRAPPER_ID = "share-dialog-wrapper"
export const PREFERENCE_DIALOG_WRAPPER_ID = "preference-dialog-wrapper"

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
