import "./ShareDialog.scss"
import { BaseDialog, SHARE_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { consoleDebug } from "../../util/log"
import { useEffect, useMemo, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import { showSnackbar } from "../react/Snackbar"
import { IconButton } from "../react/Button"

function ShareDialog(props: BaseDialogOpenProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const title = useMemo(() => {
        return document.title
    }, [])

    const url = useMemo(() => {
        const encodedUrl = window.location.href
        return encodedUrl.endsWith("/") ? encodedUrl.substring(0, encodedUrl.length - 1) : encodedUrl
    }, [])

    useEffect(() => {
        const qrcodeContainer = containerRef.current?.querySelector(".share-qrcode-picture") as HTMLElement

        // 生成二维码，不要使用 svg，在浏览器中渲染时会出现点阵网格
        const qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "canvas",
            data: url,
            image: "",
            qrOptions: {
                errorCorrectionLevel: "M"
            },
            cornersSquareOptions: {
                type: "rounded",
            },
            dotsOptions: {
                color: "#000000",
                type: "extra-rounded"
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 140
            }
        });
        qrCode.append(qrcodeContainer)
    }, [])

    return (
        <BaseDialog openCount={openCount++}>
            <div ref={containerRef} className="center-items">
                <div className="share-qrcode-picture">
                </div>
                <p className="share-title">{title}</p>
                <ShareUrlItem url={url} />
            </div>
        </BaseDialog>
    )
}

interface ShareUrlItemProps {
    url: string
}

function ShareUrlItem(props: ShareUrlItemProps) {
    function onClickCopyUrl() {
        navigator.clipboard.writeText(props.url).then(() => {
            showSnackbar("已复制链接到剪贴板")
            consoleDebug("Copy url success: " + props.url)
        }).catch(err => {
            showSnackbar("复制链接失败")
            consoleDebug("Copy url failed: " + err)
        })
    }

    return (
        <div className="share-url-item">
            <div className="share-url-span-wrapper">
                <span className="share-url-span">{props.url}</span>
            </div>
            <IconButton icon="content_paste" onClick={onClickCopyUrl} classes={["btn-copy-url"]} />
        </div>
    )
}

let openCount = 0
export function showShareDialog() {
    showDialog(<ShareDialog openCount={openCount++} />, SHARE_DIALOG_WRAPPER_ID)
}
