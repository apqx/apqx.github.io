import React from "react";
import {createRoot} from 'react-dom/client'
import {MDCDialog} from "@material/dialog"
import {MDCRipple} from "@material/ripple"
import {console_debug} from "../util/logutil";

export class BasicDialog extends React.Component {
    constructor(props) {
        super(props)
        console_debug("BasicDialog constructor")
    }

    componentDidMount() {
        console_debug("BasicDialog componentDidMount")
    }

    componentWillUnmount() {
        console_debug("BasicDialog componentWillUnmount")
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        console_debug("BasicDialog componentDidUpdate")
    }

    initDialog(dialogE) {
        console_debug("BasicDialog initDialog " + dialogE)
        if (dialogE == null) return
        this.mdcDialog = new MDCDialog(dialogE)
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
        if (this.props.open) {
            this.mdcDialog.open()
        } else {
            this.mdcDialog.close()
        }
    }

    initActionBtn(btnE) {
        if (btnE == null) return
        new MDCRipple(btnE)
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
                        {(this.props.btnText !== undefined && this.props.btnText !== null) &&
                            <div className="mdc-dialog__actions basic-dialog_actions">
                                <button type="button"
                                        className="mdc-button btn-common mdc-button--unelevated basic-dialog_btn_action"
                                        data-mdc-dialog-action="cancel"
                                        ref={e => this.initActionBtn(e)}
                                        onClick={this.props.btnOnClick}
                                        id="basic-dialog_btn_close"
                                        tabIndex="0">
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

/**
 * 弹出Dialog
 * @param _open 是否弹出
 * @param _wrapperId Dialog要添加到的位置
 * @param _fixedWidth 是否固定Dialog宽度，false则Dialog会适应children的宽度
 * @param _contentElement Dialog的Content，JSX.Element
 * @param _btnText Action Button显示的文字
 * @param _onClickBtn Action Button的点击监听
 */
export function showDialog(_open, _wrapperId, _fixedWidth, _contentElement, _btnText, _onClickBtn) {
    let root = undefined
    for (const item of roots) {
        if (item.id === _wrapperId) {
            if (item.root === undefined || item.root === null) {
                console_debug("--------create root " + item.id)
                item.root = createRoot(document.getElementById(item.id))
            }
            root = item.root
            break
        }
    }
    if (root === undefined || root === null) return
    root.render(
        <BasicDialog
            fixedWidth={_fixedWidth}
            open={_open}
            contentElement={_contentElement}
            btnText={_btnText}
            btnOnClick={_onClickBtn}
        />
    )
}