import "./InfoDialog.scss"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedResize } from "../react/tools/useDebouncedResize"
import { BaseDialog, getDialogController, INFO_DIALOG_WRAPPER_ID, showDialog, type BaseDialogController, type BaseDialogOpenProps, type DialogControllerRef } from "./BaseDialog"
import { getChromeVersion } from "../../util/tools"
import { Tag } from "../react/Tag"
import { Button } from "../react/Button"


function InfoDialog(props: BaseDialogOpenProps) {
    const [chromeVersion, setChromeVersion] = useState<string | null>(null)

    useEffect(() => {
        getChromeVersion().then(version => setChromeVersion(version))
    }, [])

    // 监听窗口尺寸变化，触发组件刷新
    useDebouncedResize(document.body)

    const clearLocalStorage = useCallback(() => {
        localStorage.clear()
    }, [])

    const refreshPage = useCallback(() => {
        window.location.reload()
    }, [])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef}>
            <div className="info-dialog-content">
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
                <p><strong className="no-shadow">Local storage</strong></p>
                <div className="btn-tag-container">
                    <Button text="Clear" tabIndex={-1} onClick={clearLocalStorage}/>
                    <Button text="Refresh" tabIndex={-1} onClick={refreshPage}/>
                </div>
            </div>
        </BaseDialog>
    )
}

export function showInfoDialog() {
    const id = INFO_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<InfoDialog dialogControllerRef={dialogControllerRef} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}