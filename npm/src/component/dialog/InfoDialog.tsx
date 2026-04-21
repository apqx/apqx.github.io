import { BaseDialog, INFO_DIALOG_WRAPPER_ID, showDialog, type BaseDialogOpenProps } from "./BaseDialog"
import "./InfoDialog.scss"


function InfoDialog(props: BaseDialogOpenProps) {

    return (
        <BaseDialog openCount={props.openCount}>
            <div>
                <p>window.size : {window.innerWidth} x {window.innerHeight}</p>
            </div>
        </BaseDialog>
    )
}

let openCount = 0
export function showInfoDialog() {
    showDialog(<InfoDialog openCount={openCount++} />, INFO_DIALOG_WRAPPER_ID)
}