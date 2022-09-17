import {showDialog} from "./BasicDialog";
import React, {Component} from "react";
import {MDCLinearProgress} from "@material/linear-progress";

class ShortLinkJumpDialogContent extends Component {

    initProgressbar(e) {
        if (e == null) return
        this.progressbar = new MDCLinearProgress(e)
        this.progressbar.determinate = false
    }

    render() {
        // 加tabIndex="0"为了解决Dialog弹出时可能出现的无法获得焦点或焦点位置不合适的问题
        return (
            <div className="center-horizontal">
                <p id="short-link-jump-dialog_emoji">😶</p>
                <p id="short-link-jump-dialog_title">{this.props.title}</p>
                <p id="short-link-jump-dialog_link" className="center-horizontal">
                    <a className="clickable-empty-link" tabIndex="0" onClick={this.props.onClickLink}>{this.props.content}</a>
                </p>
                <div role="progressbar" className="mdc-linear-progress" aria-label="Short Link Jump Progress Bar"
                     aria-valuemin="0"
                     aria-valuemax="1" aria-valuenow="0"
                     ref={e => this.initProgressbar(e)}>
                    <div className="mdc-linear-progress__buffer">
                        <div className="mdc-linear-progress__buffer-bar"></div>
                        <div className="mdc-linear-progress__buffer-dots"></div>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                        <span className="mdc-linear-progress__bar-inner"></span>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                        <span className="mdc-linear-progress__bar-inner"></span>
                    </div>
                </div>
            </div>
        )
    }
}

export function showShortLinkJumpDialog(_title, _content, _onClickLink) {
    // console.log("showAlert content = " + contentHTML)
    const dialogContentElement = <ShortLinkJumpDialogContent title={_title} content={_content} onClickLink={_onClickLink}/>
    showDialog(false, dialogContentElement, undefined, undefined)
}