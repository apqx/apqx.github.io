import * as React from "react";
import {console_debug} from "../util/LogUtil";
import {MDCDialog} from "@material/dialog";
import {MDCRipple} from "@material/ripple";
import {createRoot, Root} from "react-dom/client";

export interface BasicDialogProps {
    fixedWidth: boolean,
    btnText: string,
    btnOnClick: (e: React.MouseEvent<HTMLElement>) => void,
    closeOnClickOutside: boolean
}

export abstract class BasicDialog<T extends BasicDialogProps, V> extends React.Component<T, V> {
    mdcDialog: MDCDialog

    constructor(props: T) {
        super(props);
        this.mdcDialog = null
        console_debug("BasicDialog constructor")
    }

    componentDidMount() {
        console_debug("BasicDialog componentDidMount")
        if (this.mdcDialog != null && !this.mdcDialog.isOpen)
            this.mdcDialog.open()
    }

    componentWillUnmount() {
        console_debug("BasicDialog componentWillUnmount")
        this.mdcDialog = null
        mdcDialog = null
    }

    shouldComponentUpdate(nextProps: Readonly<T>, nextState: Readonly<V>, nextContext: any): boolean {
        // 在这里可以确保每一次数据变化都会检查dialog是否打开了
        // 但是在tagDialog如果加载失败而用户关闭了dialog，则自己又会弹出来
        // if (this.mdcDialog != null && !this.mdcDialog.isOpen)
        //     this.mdcDialog.open()
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

    initDialog(e: Element) {
        console_debug("BasicDialog initDialog " + e)
        if (e == null) return
        if (this.mdcDialog == null) {
            this.mdcDialog = new MDCDialog(e)
            mdcDialog = this.mdcDialog
            if (!this.props.closeOnClickOutside) {
                // 设置为空，点击Dialog外部，不取消
                this.mdcDialog.scrimClickAction = ""
            }
            this.mdcDialog.listen("MDCDialog:opened", () => {
                // 列表滚动到顶部，执行一次即可
                document.getElementById("basic-dialog-content").scrollTo(
                    {
                        top: 0,
                        behavior: "smooth"
                    }
                )
                // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
                // 但是Button获取焦点后颜色会变化，所以立即取消焦点
                const btnCloseE = document.getElementById("basic-dialog_btn_close")
                if (btnCloseE != null) {
                    // btnCloseE.focus()
                    btnCloseE.blur()
                }
                this.onDialogOpen()
            })
            this.mdcDialog.listen("MDCDialog:closing", () => {
                this.onDialogClose()
            })
        }
    }

    initActionBtn(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        console_debug("BasicDialog render")
        return (
            <div className="mdc-dialog" ref={e => this.initDialog(e)}>
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
                                        className="mdc-button btn-common mdc-button--unelevated basic-dialog_btn_action"
                                        data-mdc-dialog-action="cancel"
                                        ref={e => this.initActionBtn(e)}
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

const COMMON_DIALOG_WRAPPER_ID = "common-dialog-wrapper"
let mdcDialog: MDCDialog = null

let root: Root = null
let lastDialogType = null
export function showDialog(_contentElement: JSX.Element) {
    if (root == null)
        root = createRoot(document.getElementById(COMMON_DIALOG_WRAPPER_ID))
    root.render(_contentElement)
    if (mdcDialog != null && lastDialogType != null && _contentElement.type == lastDialogType) {
            // dialog的第一次加载一定会执行componentDidMount，在那里处理第一次弹出
            // 在这里实现对于同一个dialog的多次点击弹出，即使内容不变，只要保留有上一次弹出时的mdcDialog对象即可
            // 切换到其它dialog的时候，而且这个对象可能已经过时了，所以这种情况下不open
            mdcDialog.open()
    }
    lastDialogType = _contentElement.type
}