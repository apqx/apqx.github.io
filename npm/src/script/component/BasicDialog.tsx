import * as React from "react";
import { console_debug } from "../util/LogUtil";
import { MDCDialog } from "@material/dialog";
import { MDCRipple } from "@material/ripple";
import { createRoot, Root } from "react-dom/client";
import ReactDOM from "react-dom";

export interface BasicDialogProps {
    fixedWidth: boolean,
    btnText: string,
    btnOnClick: (e: React.MouseEvent<HTMLElement>) => void,
    closeOnClickOutside: boolean
}

export abstract class BasicDialog<T extends BasicDialogProps, V> extends React.Component<T, V> {
    mdcDialog: MDCDialog
    rootE: Element
    btnCloseE: HTMLElement

    constructor(props: T) {
        super(props);
        this.mdcDialog = null
        console_debug("BasicDialog constructor")
    }

    componentDidMount() {
        console_debug("BasicDialog componentDidMount")
        this.rootE = ReactDOM.findDOMNode(this) as Element
        this.initDialog()
        this.mdcDialog.open()
    }

    componentWillUnmount() {
        console_debug("BasicDialog componentWillUnmount")
        this.mdcDialog = null
    }

    shouldComponentUpdate(nextProps: Readonly<T>, nextState: Readonly<V>, nextContext: any): boolean {
        // 由子类覆写
        return true;
    }

    componentDidUpdate(prevProps: Readonly<BasicDialogProps>, prevState: Readonly<any>, snapshot?: any) {
        console_debug("BasicDialog componentDidUpdate")
    }

    onDialogOpen(): void {
        console_debug("BasicDialog onDialogOpen")
    }

    onDialogClose(): void {
        console_debug("BasicDialog onDialogClose")
    }

    initDialog() {
        console_debug("BasicDialog initDialog " + this.rootE)
        if (this.rootE == null) return
        this.mdcDialog = new MDCDialog(this.rootE)
        if(this.props.btnText != null) {
            this.btnCloseE = this.rootE.querySelector("#basic-dialog_btn_close")
            new MDCRipple(this.btnCloseE)
        }
        // 缓存dialog对象供外部调用
        let rootDialog = rootDialogMap.get(currentDialogWrapperId)
        rootDialog.dialog = this.mdcDialog
        if (!this.props.closeOnClickOutside) {
            // 设置为空，点击Dialog外部，不取消
            this.mdcDialog.scrimClickAction = ""
        }
        this.mdcDialog.listen("MDCDialog:opened", () => {
            console_debug("Dialog open event")
            // 多个dialog可能都注册了监听事件，只响应打开的那个
            // 但是应该会自动检测是否是自己的事件，经验证确实会判断，所以这里无需如此
            // if(!this.mdcDialog.isOpen) return
            // 列表滚动到顶部，执行一次即可
            document.getElementById("basic-dialog-content").scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            )
            this.handleFocus();
            this.onDialogOpen()
        })
        this.mdcDialog.listen("MDCDialog:closing", () => {
            this.onDialogClose()
        })
    }

    handleFocus() {
        if (this.btnCloseE == null) return
        console_debug("BasicDialog handleFocus")
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        this.btnCloseE.focus()
        this.btnCloseE.blur()
    }

    render() {
        console_debug("BasicDialog render")
        return (
            <div className="mdc-dialog">
                <div className="mdc-dialog__container">
                    <div
                        className={this.props.fixedWidth ? "mdc-dialog__surface common-dialog-container" : "mdc-dialog__surface"}
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
                                    className="mdc-button btn-round mdc-button--unelevated basic-dialog_btn_action"
                                    data-mdc-dialog-action="cancel"
                                    onClick={this.props.btnOnClick}
                                    id="basic-dialog_btn_close"
                                    tabIndex={0}>
                                    <span className="mdc-button__ripple"></span>
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

    abstract dialogContent(): JSX.Element
}

export const COMMON_DIALOG_WRAPPER_ID = "common-dialog-wrapper"
export const TAG_DIALOG_WRAPPER_ID = "tag-dialog-wrapper"
export const SEARCH_DIALOG_WRAPPER_ID = "search-dialog-wrapper"
export const ABOUT_DIALOG_WRAPPER_ID = "about-dialog-wrapper"
export const PREFERENCE_DIALOG_WRAPPER_ID = "preference-dialog-wrapper"

interface RootDialog {
    root: Root
    dialog: MDCDialog
}

// 缓存每种dialog的root和dialog实例，即使该类型dialog的内容变化，其仍是同一个dialog对象

let dialogContainerE = null
let currentDialogWrapperId = null
// id, {root, mdcDialog}
let rootDialogMap = new Map<string, RootDialog>()

export function showDialog(_contentElement: JSX.Element, _dialogWrapperId: string) {
    // 如果此时html还未加载完成，确实可能出现为null的情况
    if (document.readyState != "complete") return
    dialogContainerE = document.querySelector("#dialog_container")
    currentDialogWrapperId = _dialogWrapperId
    let root: Root = null
    let dialog: MDCDialog = null
    if (rootDialogMap.has(_dialogWrapperId)) {
        let rootDialog = rootDialogMap.get(_dialogWrapperId)
        root = rootDialog.root
        dialog = rootDialog.dialog
    } else {
        // 创建wrapper节点
        let rootE = document.createElement("div")
        rootE.setAttribute("id", _dialogWrapperId)
        dialogContainerE.appendChild(rootE)
        root = createRoot(rootE)
        let rootDialog = {
            root: root,
            dialog: null
        }
        // root对应的dialog会在之后创建时添加
        rootDialogMap.set(_dialogWrapperId, rootDialog)
    }
    root.render(_contentElement)
    if (dialog != null) {
        // dialog的第一次加载一定会执行componentDidMount，在那里处理第一次弹出
        // 在这里实现对于同一个dialog的多次点击弹出，即使内容不变，只要保留有上一次弹出时的mdcDialog对象即可
        dialog.open()
    }
}