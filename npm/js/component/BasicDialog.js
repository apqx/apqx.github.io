import React from "react";
import {createRoot} from 'react-dom/client'
import {MDCDialog} from "@material/dialog"
import {MDCRipple} from "@material/ripple"


export class BasicDialog extends React.Component {
    constructor(props) {
        super(props)
        console.log("BasicDialog constructor")
    }

    componentDidMount() {
        console.log("BasicDialog componentDidMount content = " + this.props.content)
        // 组件被添加到DOM中，只会执行一次
    }


    componentWillUnmount() {
        console.log("BasicDialog componentWillUnmount content")
    }

    initDialog(dialogE) {
        console.log("BasicDialog initDialog " + dialogE)
        if (dialogE == null) return
        this.mdcDialog = new MDCDialog(dialogE)
        this.mdcDialog.listen("MDCDialog:opened", () => {
            // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
            // 但是Button获取焦点后颜色会变化，所以立即取消焦点
            const btnCloseE = document.getElementById("basic-dialog_btn_close")
            if (btnCloseE != null) {
                btnCloseE.focus()
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
        console.log("BasicDialog initActionBtn " + btnE)
        if (btnE == null) return
        new MDCRipple(btnE)
    }

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     // console.log("shouldComponentUpdate content = " + nextProps.content)
    //     // 状态变化，组件需要更新UI时
    //     this.openDialog(nextProps.open);
    //     return this.props.contentElement !== nextProps.contentElement ||
    //         this.props.btnText !== nextProps.btnText ||
    //         this.props.btnOnClick !== nextProps.btnOnClick
    // }

    render() {
        console.log("BasicDialog render")
        return (
            <div className="mdc-dialog" ref={e => this.initDialog(e)}>
                <div className="mdc-dialog__container ">
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
                                        tabIndex="0"
                                        id="basic-dialog_btn_close">
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

let root = undefined

/**
 * 弹出Dialog
 * @param _fixedWidth 是否固定Dialog宽度，false则Dialog会适应children的宽度
 * @param _contentElement Dialog的Content，JSX.Element
 * @param _btnText Action Button显示的文字
 * @param _onClickBtn Action Button的点击监听
 */
export function showDialog(_fixedWidth, _contentElement, _btnText, _onClickBtn) {
    if (root === undefined) {
        root = createRoot(document.getElementById("common-alert-dialog-wrapper"))
    }
    // console.log("showAlert content = " + contentHTML)
    root.render(
        <BasicDialog
            fixedWidth={_fixedWidth}
            open={true}
            contentElement={_contentElement}
            btnText={_btnText}
            btnOnClick={_onClickBtn}
        />
    )
}