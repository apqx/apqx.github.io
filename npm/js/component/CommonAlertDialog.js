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
        // 加tabIndex="0"为了解决Dialog弹出时可能出现的无法获得焦点或焦点位置不合适的问题
        return (
            <div className="center-horizontal">
                <h1 tabIndex="0">{this.props.title}</h1>
                <p className="common-alert-dialog_content" dangerouslySetInnerHTML={this.createDialogContent()}/>
            </div>
        )
    }
}

export function showAlertDialog(title, contentHTML, btnText, onClickBtn) {
    // console.log("showAlert content = " + contentHTML)
    const dialogContentElement = <CommonAlertDialogContent title={title} contentHTML={contentHTML}/>
    showDialog(true, dialogContentElement, btnText, onClickBtn)
}