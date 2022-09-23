import * as React from "react";
import {Progressbar} from "./Progressbar";
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";
import {ShortLinkJumpDialogPresenter} from "./ShortLinkJumpDialogPresenter";

interface DialogContentState {
    title: string,
    content: string,
    onClickLink: (e: React.MouseEvent<HTMLElement>) => void
}

interface DialogContentProps {
    pid: string
}

export class ShortLinkDialogContent extends React.Component<DialogContentProps, DialogContentState> {
    presenter: ShortLinkJumpDialogPresenter = null

    constructor(props) {
        super(props);
        this.presenter = new ShortLinkJumpDialogPresenter(this)
        this.state = {
            title: "正在查询",
            content: "",
            onClickLink: null
        }
    }

    componentDidMount() {
        this.presenter.findPage(this.props.pid)
    }

    shouldComponentUpdate(nextProps: Readonly<DialogContentProps>, nextState: Readonly<any>, nextContext: any): boolean {
        return true
    }

    render() {
        return (
            <div className="center-horizontal">
                <p id="short-link-jump-dialog_emoji">😶</p>
                <p id="short-link-jump-dialog_title">{this.state.title}</p>
                <p id="short-link-jump-dialog_link" className="center-horizontal">
                    <a className="clickable-empty-link" onClick={this.state.onClickLink}>{this.state.content}</a>
                </p>

                <Progressbar loading={true}/>
            </div>
        )
    }
}

export function showShortLinkJumpDialog(_pid: string) {
    const dialogContentElement = <ShortLinkDialogContent pid={_pid}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, false, dialogContentElement, undefined, undefined)
}