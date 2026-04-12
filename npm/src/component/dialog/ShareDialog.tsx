import "./ShareDialog.scss"
import { BaseDialog, SHARE_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { consoleDebug } from "../../util/log"
import { useEffect, useMemo, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import QRCode from "qrcode-generator"
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

        // 计算二维码尺寸，二维码的实际尺寸由模块数量、模块大小和边距组成
        // 若不计算，生成的二维码 margin 可能不一致
        // 虽然这样计算出的尺寸缩放到元素尺寸也会导致 margin 不一致，但至少在生成时是固定的，缩放后相差不大
        let modules = getQRCodeModulesCount(url, "M")
        let margin = 18
        let moduleSize = 6

        let qrCodeSize = modules * moduleSize + margin * 2

        consoleDebug("QRCode calculate size: " + qrCodeSize + "px, margin: " + margin + "px")

        if (qrCodeSize < 300) {
            // 最小尺寸为 300x300，否则放大会出现毛边
            qrCodeSize = 300
             // 设置固定 margin
            margin = 15
            consoleDebug("QRCode calculate size < 300, use size: " + qrCodeSize + "px, margin: " + margin + "px")
        }

        // 生成二维码，不要使用 svg，在浏览器中渲染时会出现点阵网格
        const qrCode = new QRCodeStyling(
            {
                type: "canvas",
                shape: "square",
                width: qrCodeSize,
                height: qrCodeSize,
                data: url,
                margin: margin,
                qrOptions: {
                    typeNumber: 0,
                    mode: "Byte",
                    errorCorrectionLevel: "M"
                },
                dotsOptions: {
                    type: "extra-rounded",
                    color: "#000000",
                    roundSize: true
                },
                backgroundOptions: {
                    round: 0,
                    color: "#ffffff"
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#000000"
                },
                cornersDotOptions: {
                    type: "dot",
                    color: "#000000"
                }
            }
        );
        qrCode.append(qrcodeContainer)
    }, [])

    return (
        <BaseDialog openCount={openCount++}>
            <div ref={containerRef} className="center-inline-items">
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
            <div className="btn-wrapper">
                <IconButton icon="content_paste" onClick={onClickCopyUrl} classes={["btn-copy-url"]} tabIndex={-1} />
            </div>
        </div>
    )
}

let openCount = 0
export function showShareDialog() {
    showDialog(<ShareDialog openCount={openCount++} />, SHARE_DIALOG_WRAPPER_ID)
}

function getQRCodeModulesCount(data: string, errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M") {
    const qr = QRCode(0, errorCorrectionLevel); // 0 = auto version
    qr.addData(data);
    qr.make();

    return qr.getModuleCount(); // e.g. 25 / 29 / 33 ...
}

