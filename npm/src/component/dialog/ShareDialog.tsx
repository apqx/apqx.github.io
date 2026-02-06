import "./ShareDialog.scss"
import { BasicDialog, SHARE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import React from "react"
import QRCodeStyling from "qr-code-styling"
import { showSnackbar } from "../react/Snackbar"
import { IconButton } from "../react/Button"

interface ShareDialogStats {
    title: string,
    url: string
}

class ShareDialog extends BasicDialog<BasicDialogProps, ShareDialogStats> {

    constructor(props: BasicDialogProps) {
        super(props)
        const encodedUrl = window.location.href
        this.state = {
            title: document.title,
            url: encodedUrl.endsWith("/") ? encodedUrl.substring(0, encodedUrl.length - 1) : encodedUrl
        }
    }

    componentDidMount(): void {
        super.componentDidMount()
        consoleDebug("ShareDialog componentDidMount, title = " + document.title + ", url = " + window.location.href)

        const qrcodeContainer = this.rootE?.querySelector(".share-qrcode-picture") as HTMLElement

        // 生成二维码，不要使用 svg，在浏览器中渲染时会出现点阵网格
        const qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "canvas",
            data: this.state.url,
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
    }

    dialogContent(): React.JSX.Element {
        consoleDebug("ShareDialog render")
        return (
            <div className="center-items">
                <div className="share-qrcode-picture">
                </div>
                <p className="share-title">{this.state.title}</p>
                <ShareUrlItem url={this.state.url} />
            </div>
        )
    }
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
            <IconButton icon="content_paste" onClick={onClickCopyUrl} className="btn-copy-url" />
        </div>
    )
}

let openCount = 0
export function showShareDialog() {
    showDialog(<ShareDialog openCount={openCount++} />, SHARE_DIALOG_WRAPPER_ID)
}
