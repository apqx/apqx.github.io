import "./BasicDialog.scss"
import { consoleDebug } from "../../util/log"
import { MDCDialog } from "@material/dialog"
import { MDCRipple } from "@material/ripple"
import React from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"

export interface BasicDialogProps {
    // 用于启动dialog的计数，每次+1，用于弹出dialog
    openCount: number,
    fixedWidth: boolean,
    btnText: string | undefined,
    OnClickBtn: ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
    closeOnClickOutside: boolean
}

export abstract class BasicDialog<T extends BasicDialogProps, V> extends React.Component<T, V> {
    protected containerRef: React.RefObject<HTMLDivElement | null> = React.createRef()

    mdcDialog: MDCDialog | null = null
    rootE: Element | null = null
    btnCloseE: HTMLElement | null = null
    dialogContentE: HTMLElement | null = null
    scrollToTopOnDialogOpen: boolean = true
    listenScroll: boolean = false

    constructor(props: T) {
        super(props)
        consoleDebug("BasicDialog constructor")
    }

    componentDidMount() {
        consoleDebug("BasicDialog componentDidMount")
        this.rootE = this.containerRef.current as Element
        this.initDialog()
        this.mdcDialog?.open()
    }

    componentWillUnmount() {
        consoleDebug("BasicDialog componentWillUnmount")
        this.mdcDialog = null
    }

    shouldComponentUpdate(nextProps: Readonly<T>, nextState: Readonly<V>, nextContext: any): boolean {
        consoleDebug("BasicDialog shouldComponentUpdate")
        if (nextProps.openCount != this.props.openCount) {
            this.mdcDialog?.open()
        }
        // 由子类覆写
        return true
    }

    componentDidUpdate(prevProps: Readonly<BasicDialogProps>, prevState: Readonly<any>, snapshot?: any) {
        consoleDebug("BasicDialog componentDidUpdate")
        // 检查搜索结果的尺寸，设置container尺寸，触发动画
    }

    onDialogOpen(): void {
        consoleDebug("BasicDialog onDialogOpen")
    }

    onDialogClose(): void {
        consoleDebug("BasicDialog onDialogClose")
    }

    initDialog() {
        consoleDebug("BasicDialog initDialog " + this.rootE)
        if (this.rootE == null) return
        this.dialogContentE = this.rootE.querySelector("#basic-dialog-content")
        this.initScrollListener()
        this.mdcDialog = new MDCDialog(this.rootE)
        if (this.props.btnText != null) {
            this.btnCloseE = this.rootE.querySelector("#basic-dialog_btn_close")
            this.btnCloseE?.scroll
            new MDCRipple(this.btnCloseE!!)
        }

        if (!this.props.closeOnClickOutside) {
            // 设置为空，点击Dialog外部，不取消
            this.mdcDialog.scrimClickAction = ""
        }
        // 启动open动画
        this.mdcDialog.listen("MDCDialog:opening", () => {
            consoleDebug("Dialog opening")
        })
        // open动画结束
        this.mdcDialog.listen("MDCDialog:opened", () => {
            consoleDebug("Dialog opened")
            this.onDialogOpen()
            this.handleFocus()
            if (this.scrollToTopOnDialogOpen) {
                this.scrollToTop()
            }
        })
        // 启动close动画
        this.mdcDialog.listen("MDCDialog:closing", () => {
            consoleDebug("Dialog closing")
            this.onDialogClose()
        })
        // close动画结束
        this.mdcDialog.listen("MDCDialog:closed", () => {
            consoleDebug("Dialog closed")
            // dialog关闭之后，display会被设置为none，此时测量尺寸结果会是0
        })
        this.mdcDialog.open()
    }

    scrollToTop(smooth: boolean = true) {
        if (smooth) {
            this.dialogContentE?.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            )
        } else {
            this.dialogContentE?.scrollTo(
                {
                    top: 0,
                    behavior: "instant"
                }
            )
        }
    }

    initScrollListener() {
        if (!this.listenScroll) return

        let lastScrollTop = -1
        let lastFireTime = 0
        this.dialogContentE!!.addEventListener("scroll", () => {
            // consoleDebug("BasicDialog scrollHeight = " + this.dialogContentE.scrollHeight + ", clientHeight = " + this.dialogContentE.clientHeight +
            //     ", scrollTop = " + this.dialogContentE.scrollTop
            // )
            if (!this.mdcDialog?.isOpen) return
            if (this.dialogContentE!!.clientHeight == 0) return
            const newScrollTop = this.dialogContentE!!.scrollTop
            if (lastScrollTop == -1) {
                lastScrollTop = newScrollTop
                return
            }
            // 向上滚动不触发
            // consoleDebug("BasicDialog scroll newScrollTop = " + newScrollTop + ", lastScrollTop = " + lastScrollTop)
            const upScroll = newScrollTop <= lastScrollTop
            lastScrollTop = newScrollTop
            if (upScroll) return
            if (this.dialogContentE!!.scrollHeight - this.dialogContentE!!.clientHeight - this.dialogContentE!!.scrollTop < this.dialogContentE!!.clientHeight / 2) {
                if (Date.now() - lastFireTime < 100) return
                consoleDebug("BasicDialog scroll near to bottom, should fire load more")
                this.scrollNearToBottom()
                lastFireTime = Date.now()
            }
        })
    }

    scrollNearToBottom() { }

    handleFocus() {
        if (this.btnCloseE == null) return
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        this.btnCloseE.focus()
        this.btnCloseE.blur()
    }

    render() {
        consoleDebug("BasicDialog render")
        return (
            <div ref={this.containerRef} className="mdc-dialog">
                <div className="mdc-dialog__container">
                    <div
                        className={this.props.fixedWidth ? "mdc-dialog__surface mdc-dialog__fixed-width" : "mdc-dialog__surface"}
                        role="alertdialog" aria-modal="true"
                        aria-labelledby="basic-dialog-title"
                        aria-describedby="basic-dialog-content">
                        <div className="mdc-dialog__content mdc-theme--on-surface"
                            id="basic-dialog-content">
                            {this.dialogContent()}
                        </div>
                        {(this.props.btnText != null) &&
                            <div className="mdc-dialog__actions basic-dialog_actions">
                                <button type="button"
                                    className="mdc-button basic-dialog_btn_action"
                                    data-mdc-dialog-action="cancel"
                                    onClick={this.props.OnClickBtn}
                                    id="basic-dialog_btn_close"
                                    tabIndex={0}>
                                    <span className="mdc-button__label"
                                        id="basic-dialog_btn_close_label"
                                    >{this.props.btnText}</span>
                                </button>
                            </div>
                        }
                    </div>
                </div>
                <div className="mdc-dialog__scrim"></div>
            </div>
        )
    }

    abstract dialogContent(): React.JSX.Element
}

export const COMMON_DIALOG_WRAPPER_ID = "common-dialog-wrapper"
export const TAG_DIALOG_WRAPPER_ID = "tag-dialog-wrapper"
export const SEARCH_DIALOG_WRAPPER_ID = "search-dialog-wrapper"
export const ABOUT_DIALOG_WRAPPER_ID = "about-dialog-wrapper"
export const SHARE_DIALOG_WRAPPER_ID = "share-dialog-wrapper"
export const PREFERENCE_DIALOG_WRAPPER_ID = "preference-dialog-wrapper"

// 缓存每种dialog的root和dialog实例，即使该类型dialog的内容变化，其仍是同一个dialog对象
// 每个tag都使用自己单独的Dialog
let dialogContainerE: HTMLElement | null = null
let rootDialogMap = new Map<string, Root>()

export function showDialog(_contentElement: React.JSX.Element, _dialogWrapperId: string) {
    // 如果此时html还未加载完成，确实可能出现为null的情况
    if (document.readyState === "loading") return
    dialogContainerE = document.querySelector("#dialog_container")
    let root: Root | undefined
    if (rootDialogMap.has(_dialogWrapperId)) {
        root = rootDialogMap.get(_dialogWrapperId)
    } else {
        // 创建wrapper节点
        let rootE = document.createElement("div")
        rootE.setAttribute("id", _dialogWrapperId)
        dialogContainerE!!.appendChild(rootE)
        root = createRoot(rootE)
        // root对应的dialog会在之后创建时添加
        rootDialogMap.set(_dialogWrapperId, root)
    }
    root?.render(_contentElement)
}
