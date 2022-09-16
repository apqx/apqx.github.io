import React from "react"
import {showDialog} from "./BasicDialog";

class CommonAlertDialogContent extends React.Component {
    constructor(props) {
        super(props)
    }

    createDialogContent() {
        return {__html: this.props.contentHTML}
    }

    render() {
        // console.log("render content = " + this.props.content)
        return (
            <div>
                <h1>{this.props.title}</h1>
                <p className="common-alert-dialog_content" dangerouslySetInnerHTML={this.createDialogContent()}/>
            </div>
        )
    }
}

export function showAlertDialog(title, contentHTML, btnText, onClickBtn) {
    // console.log("showAlert content = " + contentHTML)
    const dialogContentElement = <CommonAlertDialogContent title={title} contentHTML={contentHTML}/>
    showDialog(dialogContentElement, btnText, onClickBtn)
}