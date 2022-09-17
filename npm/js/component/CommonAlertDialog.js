import React from "react"
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";

class CommonAlertDialogContent extends React.Component {
    constructor(props) {
        super(props)
    }

    createDialogContent() {
        return {__html: this.props.contentHTML}
    }

    render() {
        return (
            <div className="center-horizontal">
                <h1>{this.props.title}</h1>
                <p className="common-alert-dialog_content" dangerouslySetInnerHTML={this.createDialogContent()}/>
            </div>
        )
    }
}

export function showAlertDialog(title, contentHTML, btnText, onClickBtn) {
    const dialogContentElement = <CommonAlertDialogContent title={title} contentHTML={contentHTML}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, btnText, onClickBtn)
}