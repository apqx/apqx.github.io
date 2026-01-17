import "./ShareDialog.scss"
import { BasicDialog, SHARE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import React from "react"
import QRCodeStyling from "qr-code-styling"

interface ShareDialogStats {
    title: string,
    url: string
}

class ShareDialog extends BasicDialog<BasicDialogProps, ShareDialogStats> {

    constructor(props: BasicDialogProps) {
        super(props)
        this.state = {
            title: document.title,
            url: window.location.href
        }
    }

    componentDidMount(): void {
        super.componentDidMount()
        consoleDebug("ShareDialog componentDidMount, title = " + document.title + ", url = " + window.location.href)
        const qrcodeImageE = this.rootE?.querySelector("#qrcode") as HTMLImageElement
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
                    {/* <img className="inline-for-center" alt="qrcode" /> */}
                </div>
                <p className="share-title">{this.state.title}</p>
                <pre>
                    <code className="share-url">{this.state.url}</code>
                </pre>
            </div>
        )
    }
}

let openCount = 0
export function showShareDialog() {
    showDialog(<ShareDialog openCount={openCount++} fixedWidth={false} btnText={"关闭"}
        OnClickBtn={undefined}
        closeOnClickOutside={true} />, SHARE_DIALOG_WRAPPER_ID)
}
