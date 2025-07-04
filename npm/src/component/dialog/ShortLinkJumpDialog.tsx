// import "./ShortLinkJumpDialog.scss"
import * as React from "react"
import { ProgressLinear } from "../react/ProgressLinear"
import { BasicDialog, BasicDialogProps, COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import { ShortLinkJumpDialogPresenter } from "./ShortLinkJumpDialogPresenter"

interface DialogContentState {
    title: string,
    content: string,
    onClickLink: (e: React.MouseEvent<HTMLElement>) => void
}

interface DialogContentProps extends BasicDialogProps {
    pid: string
}

export class ShortLinkDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    presenter: ShortLinkJumpDialogPresenter

    constructor(props: DialogContentProps) {
        super(props)
        this.presenter = new ShortLinkJumpDialogPresenter(this)
        this.state = {
            title: "查询映射",
            content: this.props.pid,
            onClickLink: () => {}
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.presenter.findPage(this.props.pid)
    }

    dialogContent(): JSX.Element {
        return (
            <div className="items-center">
                <picture>
                    <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.webp"
                        type="image/webp" />
                    <img width="164px" height="164px" className="inline-for-center" alt=""
                        src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.gif" />
                </picture>
                <p id="short-link-jump-dialog_title">{this.state.title}</p>
                <p id="short-link-jump-dialog_link" className="items-center">
                    <a className="clickable-empty-link" onClick={this.state.onClickLink}>{this.state.content}</a>
                </p>

                <ProgressLinear loading={true} />
            </div>
        )
    }
}

let openCount = 0
export function showShortLinkJumpDialog(_pid: string) {
    showDialog(<ShortLinkDialog openCount={openCount++} pid={_pid} fixedWidth={false} btnText={undefined}
        OnClickBtn={undefined} closeOnClickOutside={false} />, COMMON_DIALOG_WRAPPER_ID)
}
