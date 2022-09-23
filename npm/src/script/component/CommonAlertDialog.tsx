import * as React from "react"
import {createHtmlContent} from "../util/Tools"
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog"

interface Props {
    title: string,
    contentHTML: string
}

class CommonAlertDialogContent extends React.Component<Props, any> {

    render() {
        return (
            <div className="center-horizontal">
                <h1>{this.props.title}</h1>
                <p className="common-alert-dialog_content"
                   dangerouslySetInnerHTML={createHtmlContent(this.props.contentHTML)}/>
            </div>
        )
    }
}

export function showAlertDialog(title: string, contentHTML: string, btnText: string, onClickBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    const dialogContentElement = <CommonAlertDialogContent title={title} contentHTML={contentHTML}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, btnText, onClickBtn)
}