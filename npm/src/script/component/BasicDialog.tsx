import * as React from "react";
import {console_debug} from "../util/LogUtil";
import {MDCDialog} from "@material/dialog";
import {MDCRipple} from "@material/ripple";
import {createRoot, Root} from "react-dom/client";

interface Props {
    open: boolean,
    fixedWidth: boolean,
    contentElement: JSX.Element,
    btnText: string,
    btnOnClick: (e: React.MouseEvent<HTMLElement>) => void
}

export class BasicDialog extends React.Component<Props, any> {
    mdcDialog: MDCDialog

    constructor(props: Props) {
        super(props);
        this.mdcDialog = null
        console_debug("BasicDialog constructor")
    }

    componentDidMount() {
        console_debug("BasicDialog componentDidMount")
    }

    componentWillUnmount() {
        console_debug("BasicDialog componentWillUnmount")
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any) {
        console_debug("BasicDialog componentDidUpdate")
    }

    initDialog(e: Element) {
        console_debug("BasicDialog initDialog " + e)
        if (e == null) return
        if (this.mdcDialog == null) {
            this.mdcDialog = new MDCDialog(e)
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
            })
        }
        if (this.props.open) {
            this.mdcDialog.open()
        } else {
            this.mdcDialog.close()
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
                            {this.props.contentElement}
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
}

export const COMMON_DIALOG_WRAPPER_ID = "common-dialog-wrapper"
export const SEARCH_DIALOG_WRAPPER_ID = "search-dialog-wrapper"
export const TAG_DIALOG_WRAPPER_ID = "tag-dialog-wrapper"
export const ABOUT_ME_DIALOG_WRAPPER_ID = "about-me-dialog-wrapper"

const roots = [
    {
        id: COMMON_DIALOG_WRAPPER_ID,
        root: undefined
    },
    {
        id: SEARCH_DIALOG_WRAPPER_ID,
        root: undefined
    },
    {
        id: TAG_DIALOG_WRAPPER_ID,
        root: undefined
    },
    {
        id: ABOUT_ME_DIALOG_WRAPPER_ID,
        root: undefined
    },
]

// TODO: 传入一个ID，表示Content是否变化
export function showDialog(_open: boolean, _wrapperId: string, _fixedWidth: boolean, _contentElement: JSX.Element,
                           _btnText: string, _onClickBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    let root: Root = null
    for (const item of roots) {
        if (item.id === _wrapperId) {
            if (item.root == null) {
                console_debug("--------create root " + item.id)
                item.root = createRoot(document.getElementById(item.id))
            }
            root = item.root
            break
        }
    }
    if (root == null) return
    root.render(
        <BasicDialog
            open={_open}
            fixedWidth={_fixedWidth}
            contentElement={_contentElement}
            btnText={_btnText}
            btnOnClick={_onClickBtn}
        />
    )
}