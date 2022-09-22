import * as React from "react";
import {Progressbar} from "./Progressbar";
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";

interface DialogContentProps {
    title: string,
    content: string,
    onClickLink: (e: React.MouseEvent<HTMLElement>) => void
}

class DialogContent extends React.Component<DialogContentProps, any> {
    render() {
        return (
            <div className="center-horizontal">
                <p id="short-link-jump-dialog_emoji">😶</p>
                <p id="short-link-jump-dialog_title">{this.props.title}</p>
                <p id="short-link-jump-dialog_link" className="center-horizontal">
                    <a className="clickable-empty-link" onClick={this.props.onClickLink}>{this.props.content}</a>
                </p>

                <Progressbar loading={true}/>
            </div>
        )
    }
}

export function showShortLinkJumpDialog(_title: string, _content: string, _onClickLink: (e: React.MouseEvent<HTMLElement>) => void) {
    const dialogContentElement = <DialogContent title={_title} content={_content} onClickLink={_onClickLink}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, false, dialogContentElement, undefined, undefined)
}