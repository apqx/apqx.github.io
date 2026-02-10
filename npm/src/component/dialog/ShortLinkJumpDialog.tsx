import "./ShortLinkJumpDialog.scss"
import { useEffect, useMemo, useSyncExternalStore } from "react"
import { ProgressLinear } from "../react/ProgressLinear"
import { BaseDialog, COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { ShortLinkJumpDialogPresenter } from "./ShortLinkJumpDialogPresenter"

interface ShortLinkJumpDialogProps extends BaseDialogOpenProps {
    pid: string
}

export function ShortLinkDialog(props: ShortLinkJumpDialogProps) {
    const presenter = useMemo(() => new ShortLinkJumpDialogPresenter(props.pid), [])

    const state = useSyncExternalStore(presenter.subscribe, () => presenter.state)

    useEffect(() => {
        presenter.findPage(props.pid)
    }, [])

    return (
        <BaseDialog openCount={props.openCount} closeOnClickOutside={false} actions={[]}>
            <div className="center-items">
                <picture>
                    <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.webp"
                        type="image/webp" />
                    <img className="inline-for-center emoji-jump" alt=""
                        src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/512.gif" />
                </picture>
                <p id="short-link-jump-dialog_title">{state.title}</p>
                <p id="short-link-jump-dialog_link" className="center-items">
                    <a className="clickable-empty-link" onClick={state.onClickLink}>{state.content}</a>
                </p>
                <ProgressLinear loading={true} />
            </div>
        </BaseDialog>
    )
}

let openCount = 0
export function showShortLinkJumpDialog(_pid: string) {
    showDialog(<ShortLinkDialog openCount={openCount++} pid={_pid} />, COMMON_DIALOG_WRAPPER_ID)
}
