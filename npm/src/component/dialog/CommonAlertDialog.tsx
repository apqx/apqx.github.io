import { createHtmlContent } from "../../util/tools"
import { BasicDialog, COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { ActionBtn, BasicDialogProps } from "./BasicDialog"

interface Props extends BasicDialogProps {
    title: string,
    contentHTML: string,
    actionCancelBtnText?: string,
    onClickActionCancelBtn?: (e: React.MouseEvent<HTMLElement>) => void,
    actionConfirmBtnText: string,
    onClickActionConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void
}

class CommonAlertDialog extends BasicDialog<Props, any> {

    configActionBtns(): ActionBtn[] {
        if (this.props.actionCancelBtnText != null) {
            return [
                { text: this.props.actionCancelBtnText, closeOnClick: true, onClick: this.props.onClickActionCancelBtn || (() => { }) },
                { text: this.props.actionConfirmBtnText || "关闭", closeOnClick: true, onClick: this.props.onClickActionConfirmBtn || (() => { }) }
            ]
        } else {
            return [{ text: this.props.actionConfirmBtnText || "关闭", closeOnClick: true, onClick: this.props.onClickActionConfirmBtn || (() => { }) }]
        }
    }

    dialogContent(): React.JSX.Element {
        return (
            <div>
                <p className="common-alert-dialog_title center-items">{this.props.title}</p>
                <p className="common-alert-dialog_content"
                    dangerouslySetInnerHTML={createHtmlContent(this.props.contentHTML)} />
            </div>
        )
    }
}

let openCount = 0
export function showAlertDialog(title: string, contentHTML: string,
    actionCancelBtnText: string | undefined, onClickCancelBtn: ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {
        showDialog(<CommonAlertDialog openCount={openCount++} title={title} contentHTML={contentHTML}
        actionCancelBtnText={actionCancelBtnText} onClickActionCancelBtn={onClickCancelBtn}
        actionConfirmBtnText={confirmBtnText} onClickActionConfirmBtn={onClickConfirmBtn} />, COMMON_DIALOG_WRAPPER_ID)
}

export function showSimpleAlertDialog(title: string, contentHTML: string,
    confirmBtnText: string, onClickConfirmBtn: (e: React.MouseEvent<HTMLElement>) => void) {
        showDialog(<CommonAlertDialog openCount={openCount++} title={title} contentHTML={contentHTML}
        actionCancelBtnText={undefined} onClickActionCancelBtn={undefined}
        actionConfirmBtnText={confirmBtnText} onClickActionConfirmBtn={onClickConfirmBtn} />, COMMON_DIALOG_WRAPPER_ID)
}
