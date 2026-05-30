import "./ShortLinkJumpDialog.scss"
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { ProgressLinear } from "../react/ProgressLinear"
import { BaseDialog, COMMON_DIALOG_WRAPPER_ID, getDialogController, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { ShortLinkJumpDialogViewModel } from "./ShortLinkJumpDialogViewModel"
import { LottieAnimation, type LottieAnimationController } from "../react/LottieAnimation"

interface ShortLinkJumpDialogProps extends BaseDialogOpenProps {
    pid: string
}

export function ShortLinkDialog(props: ShortLinkJumpDialogProps) {
    const viewModel = useMemo(() => new ShortLinkJumpDialogViewModel(props.pid), [])

    const state = useSyncExternalStore(viewModel.subscribe, () => viewModel.state)
    const animationControllerRef = useRef<LottieAnimationController | null>(null)

    useEffect(() => {
        viewModel.findPage(props.pid)
    }, [])

    const onDialogOpen = useCallback(() => {
        animationControllerRef.current?.play()
    }, [])

    const onDialogClose = useCallback(() => {
        animationControllerRef.current?.pause()
    }, [])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} closeOnClickOutside={false} actions={[]}>
            <div className="jump-dialog-container center-inline-items">
                <LottieAnimation animationDataUrl={"https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/peacock/lottie.json"}
                    animationControllerRef={animationControllerRef} />
                <p id="short-link-jump-dialog_title">{state.title}</p>
                <p id="short-link-jump-dialog_link" className="center-inline-items">
                    <a className="clickable-empty-link" onClick={state.onClickLink}>{state.content}</a>
                </p>
                <ProgressLinear loading={true} />
            </div>
        </BaseDialog>
    )
}

export function showShortLinkJumpDialog(_pid: string) {
    const id = COMMON_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<ShortLinkDialog dialogControllerRef={dialogControllerRef} pid={_pid} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}
