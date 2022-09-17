import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";
import React from "react";
import {Progressbar} from "./Progressbar";

class ShortLinkJumpDialogContent extends React.Component {
    constructor(props) {
        super(props);
    }

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

export function showShortLinkJumpDialog(_title, _content, _onClickLink) {
    const dialogContentElement = <ShortLinkJumpDialogContent title={_title} content={_content} onClickLink={_onClickLink}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, false, dialogContentElement, undefined, undefined)
}