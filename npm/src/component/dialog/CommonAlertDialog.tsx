import { useMemo } from "react"
import { createHtmlContent } from "../../util/tools"
import { BaseDialog, COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"

interface CommonAlertDialogProps extends BaseDialogOpenProps {
    title: string,
    contentHTML: string,
    actionCancelBtnText?: string,
    onClickActionCancelBtn?: (e: React.MouseEvent<HTMLElement>) => void,
    actionConfirmBtnText?: string,
    onClickActionConfirmBtn?: (e: React.MouseEvent<HTMLElement>) => void
}

let openCount = 0
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
        <BaseDialog openCount={openCount++} actions={actionBtns}>
            <div>
                <p className="common-alert-dialog_title center-inline-items">{props.title}</p>
                <p className="common-alert-dialog_content"
                    dangerouslySetInnerHTML={createHtmlContent(props.contentHTML)} />
            </div>
        </BaseDialog>
    )
}


export function showAlertDialog(title: string, contentHTML: string,
    actionCancelBtnText: string | undefined, onClickCancelBtn: ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {

    showDialog(<NewCommonAlertDialog openCount={openCount++} title={title} contentHTML={contentHTML}
        actionCancelBtnText={actionCancelBtnText} onClickActionCancelBtn={onClickCancelBtn}
        actionConfirmBtnText={confirmBtnText} onClickActionConfirmBtn={onClickConfirmBtn} />, COMMON_DIALOG_WRAPPER_ID)
}

export function showSimpleAlertDialog(title: string, contentHTML: string,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    showDialog(<NewCommonAlertDialog openCount={openCount++} title={title} contentHTML={contentHTML}
        actionCancelBtnText={undefined} onClickActionCancelBtn={undefined}
        actionConfirmBtnText={confirmBtnText} onClickActionConfirmBtn={onClickConfirmBtn} />, COMMON_DIALOG_WRAPPER_ID)
}
