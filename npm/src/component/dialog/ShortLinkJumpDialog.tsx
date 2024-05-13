import * as React from "react"
import {Progressbar} from "./Progressbar"
import {BasicDialog, BasicDialogProps, COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog"
import {ShortLinkJumpDialogPresenter} from "./ShortLinkJumpDialogPresenter"
// import "./ShortLinkJumpDialog.scss"

interface DialogContentState {
    title: string,
    content: string,
    onClickLink: (e: React.MouseEvent<HTMLElement>) => void
}

interface DialogContentProps extends BasicDialogProps{
    pid: string
}

export class ShortLinkDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    presenter: ShortLinkJumpDialogPresenter = null

    constructor(props) {
        super(props)
        this.presenter = new ShortLinkJumpDialogPresenter(this)
        this.state = {
            title: "查询映射",
            content: this.props.pid,
            onClickLink: null
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.presenter.findPage(this.props.pid)
    }

    dialogContent(): JSX.Element {
        return (
            <div className="center-horizontal">
                <picture>
                    <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.webp" type="image/webp"/>
                    <img src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.gif" alt="" width="164"
                         height="164"/>
                </picture>
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
    showDialog(<ShortLinkDialog pid={_pid} fixedWidth={false} btnText={null}
                                                 btnOnClick={null} closeOnClickOutside={false} />, COMMON_DIALOG_WRAPPER_ID)
}
