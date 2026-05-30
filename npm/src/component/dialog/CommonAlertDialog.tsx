import { useMemo, useRef } from "react"
import { createHtmlContent } from "../../util/tools"
import { BaseDialog, COMMON_DIALOG_WRAPPER_ID, getDialogController, showDialog } from "./BaseDialog"
import type { BaseDialogController, BaseDialogOpenProps, DialogControllerRef } from "./BaseDialog"

interface CommonAlertDialogProps extends BaseDialogOpenProps {
    title: string,
    contentHTML: string,
    actionCancelBtnText?: string,
    onClickActionCancelBtn?: (e: React.MouseEvent<HTMLElement>) => void,
    actionConfirmBtnText?: string,
    onClickActionConfirmBtn?: (e: React.MouseEvent<HTMLElement>) => void
}

let dialogControllerRef = { current: null } as DialogControllerRef
function NewCommonAlertDialog(props: CommonAlertDialogProps) {
    const actionBtns = useMemo(() => {
        if (props.actionCancelBtnText != null) {
            // 有两个按钮
            return [
                { text: props.actionCancelBtnText || "取消", closeOnClick: true, onClick: props.onClickActionCancelBtn || (() => { }) },
                { text: props.actionConfirmBtnText || "确认", closeOnClick: true, onClick: props.onClickActionConfirmBtn || (() => { }) }
            ]
        } else {
            // 只有一个按钮
            return [{ text: props.actionConfirmBtnText || "关闭", closeOnClick: true, onClick: props.onClickActionConfirmBtn || (() => { }) }]
        }
    }, [props.actionCancelBtnText, props.onClickActionCancelBtn, props.actionConfirmBtnText, props.onClickActionConfirmBtn])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef} actions={actionBtns}>
            <div>
                <p className="common-alert-dialog_title">{props.title}</p>
                <p className="common-alert-dialog_content"
                    dangerouslySetInnerHTML={createHtmlContent(props.contentHTML)} />
            </div>
        </BaseDialog>
    )
}


export function showAlertDialog(title: string, contentHTML: string,
    actionCancelBtnText: string | undefined, onClickCancelBtn: ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {

    const id = COMMON_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<NewCommonAlertDialog dialogControllerRef={dialogControllerRef} title={title} contentHTML={contentHTML}
        actionCancelBtnText={actionCancelBtnText} onClickActionCancelBtn={onClickCancelBtn}
        actionConfirmBtnText={confirmBtnText} onClickActionConfirmBtn={onClickConfirmBtn} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}

export function showSimpleAlertDialog(title: string, contentHTML: string,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    showAlertDialog(title, contentHTML, undefined, undefined, confirmBtnText, onClickConfirmBtn)
}
