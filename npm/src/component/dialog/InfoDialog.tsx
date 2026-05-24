import { useEffect, useState } from "react"
import { useDebouncedResize } from "../react/tools/useDebouncedResize"
import { BaseDialog, INFO_DIALOG_WRAPPER_ID, showDialog, type BaseDialogOpenProps } from "./BaseDialog"
import "./InfoDialog.scss"
import { getChromeVersion } from "../../util/tools"


function InfoDialog(props: BaseDialogOpenProps) {
    const [chromeVersion, setChromeVersion] = useState<string | null>(null)

    useEffect(() => {
        getChromeVersion().then(version => setChromeVersion(version))
    }, [])

    // 监听窗口尺寸变化，触发组件刷新
    useDebouncedResize(document.body)

    return (
        <BaseDialog openCounter={props.openCounter}>
            <div>
                <p><strong className="no-shadow">Chromium</strong></p>
                <p>version: {chromeVersion ?? "unknown"}</p>
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

let openCounter = 0
export function showInfoDialog() {
    showDialog(<InfoDialog openCounter={openCounter++} />, INFO_DIALOG_WRAPPER_ID)
}