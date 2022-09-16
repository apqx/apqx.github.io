import React from "react";
import {createRoot} from 'react-dom/client'
import {MDCDialog} from "@material/dialog"
import {MDCRipple} from "@material/ripple"


export class BasicDialog extends React.Component {
    constructor(props) {
        super(props)
        this.mdcDialog = undefined
    }

    componentDidMount() {
        // console.log("componentDidMount content = " + this.props.content)
        // 组件被添加到DOM中，只会执行一次
        this.mdcDialog = new MDCDialog(this.dialog)
        const btnCloseE = this.btnClose
        console.log(btnCloseE)
        new MDCRipple(btnCloseE)

        this.mdcDialog.listen("MDCDialog:opened", () => {
            // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
            // 但是Button获取焦点后颜色会变化，所以立即取消焦点
            if (btnCloseE !== undefined) {
                btnCloseE.focus()
                btnCloseE.blur()
            }
        })
        if (this.props.open === true) {
            this.mdcDialog.open()
        } else {
            this.mdcDialog.close()
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // console.log("shouldComponentUpdate content = " + nextProps.content)
        // 状态变化，组件需要更新UI时
        if (nextProps.open === true) {
            this.mdcDialog.open()
        } else {
            this.mdcDialog.close()
        }
        return this.props.contentElement !== nextProps.contentElement
    }

    render() {
        // console.log("render content = " + this.props.content)
        return (
            <div className="mdc-dialog" ref={e => this.dialog = e}>
                <div className="mdc-dialog__container common-dialog-container">
                    <div className="mdc-dialog__surface" role="alertdialog" aria-modal="true"
                         aria-labelledby="basic-dialog-title"
                         aria-describedby="basic-dialog-content">
                        <div className="mdc-dialog__content center-horizontal mdc-theme--on-surface"
                             id="basic-dialog-content">
                            {this.props.contentElement}
                        </div>
                        <div className="mdc-dialog__actions basic-dialog_actions">
                            <button type="button"
                                    className="mdc-button btn-common mdc-button--unelevated basic-dialog_btn_action"
                                    data-mdc-dialog-action="cancel"
                                    ref={e => this.btnClose = e}
                                    onClick={this.props.btnOnClick}>
                                <span className="mdc-button__ripple"></span>
                                <span className="mdc-button__label"
                                      id="basic-dialog_btn_close_label"
                                >{this.props.btnText}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mdc-dialog__scrim"></div>
            </div>
        )
    }
}

let root = undefined

export function showDialog(_contentElement, _btnText, _onClickBtn) {
    if (root === undefined) {
        root = createRoot(document.getElementById("common-alert-dialog-wrapper"))
    }
    // console.log("showAlert content = " + contentHTML)
    root.render(
        <BasicDialog
            open={true}
            contentElement={_contentElement}
            btnText={_btnText}
            btnOnClick={_onClickBtn}
        />
    )
}