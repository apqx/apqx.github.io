import "./InfoDialog.scss"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedResize } from "../react/tools/useDebouncedResize"
import { BaseDialog, getDialogController, INFO_DIALOG_WRAPPER_ID, showDialog, type BaseDialogController, type BaseDialogOpenProps, type DialogControllerRef } from "./BaseDialog"
import { getChromeVersion } from "../../util/tools"
import { Tag } from "../react/Tag"
import { Button } from "../react/Button"
import { List } from "../react/List"


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
        <BaseDialog dialogControllerRef={props.dialogControllerRef} fixedWidth={false}>
            <div className="info-dialog-content">
                <p><strong className="no-shadow">Information</strong></p>
                <p>
                    chromium version: {chromeVersion ?? "unknown"}<br />
                    window size: {window.innerWidth} x {window.innerHeight}<br />
                    insets top: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-top')}<br />
                    insets bottom: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-bottom')}<br />
                    insets left: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-left')}<br />
                    insets right: {getComputedStyle(document.body).getPropertyValue('--safe-area-inset-right')}
                </p>
                <p><strong className="no-shadow">Actions</strong></p>
                <div className="btn-tag-container">
                    <Tag text="Clear cookies" onClick={clearLocalStorage} />
                    <Tag text="Refresh page" onClick={refreshPage} />
                </div>
                <p><strong className="no-shadow">Links</strong></p>
                <List oneLine={false} items={[
                    {
                        title: "Share", description: document.location.origin + "/share",
                        link: "/share", newPage: true
                    },
                    {
                        title: "Sitemap", description: document.location.origin + "/sitemap.xml",
                        link: "/sitemap.xml", newPage: true
                    }
                ]} />
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