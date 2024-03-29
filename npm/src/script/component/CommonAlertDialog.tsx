import * as React from "react"
import {createHtmlContent} from "../util/Tools"
import {BasicDialog, BasicDialogProps, COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog"

interface Props extends BasicDialogProps{
    title: string,
    contentHTML: string
}

class CommonAlertDialog extends BasicDialog<Props, any> {

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<any>, nextContext: any): boolean {
        super.shouldComponentUpdate(nextProps, nextState, nextContext)
        return nextProps.title != this.props.title || nextProps.contentHTML != this.props.contentHTML;
    }

    dialogContent(): JSX.Element {
        return (
            <div>
                <p className="common-alert-dialog_title center-horizontal">{this.props.title}</p>
                <p className="common-alert-dialog_content"
                   dangerouslySetInnerHTML={createHtmlContent(this.props.contentHTML)}/>
            </div>
        )
    }
}

export function showAlertDialog(title: string, contentHTML: string, btnText: string
                                , onClickBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    showDialog(<CommonAlertDialog title={title} contentHTML={contentHTML}
                                                          fixedWidth={true} btnText={btnText} btnOnClick={onClickBtn}
                                                          closeOnClickOutside={true} />, COMMON_DIALOG_WRAPPER_ID)
}