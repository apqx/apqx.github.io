import { consoleInfo } from "../../util/log"
import { useDebouncedResize } from "../react/tools/useDebouncedResize"
import { BaseDialog, INFO_DIALOG_WRAPPER_ID, showDialog, type BaseDialogOpenProps } from "./BaseDialog"
import "./InfoDialog.scss"


function InfoDialog(props: BaseDialogOpenProps) {

    // 监听窗口尺寸变化，触发组件刷新
    useDebouncedResize(document.body)

    return (
        <BaseDialog openCount={props.openCount}>
            <div>
                <p><strong className="no-shadow">Window</strong></p>
                <p>{window.innerWidth} x {window.innerHeight}</p>
                <p><strong className="no-shadow">Insets</strong></p>
                <p>
                    top: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-top')}<br />
                    bottom: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-bottom')}<br />
                    left: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-left')}<br />
                    right: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-right')}
                </p>
            </div>
        </BaseDialog>
    )
}

let openCount = 0
export function showInfoDialog() {
    showDialog(<InfoDialog openCount={openCount++} />, INFO_DIALOG_WRAPPER_ID)
}