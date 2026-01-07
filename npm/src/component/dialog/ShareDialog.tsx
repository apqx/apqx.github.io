import "./ShareDialog.scss"
import { BasicDialog, SHARE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import React from "react"
import { type QRCodeToDataURLOptions } from "qrcode"
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
        const qrcodeE = this.rootE?.querySelector(".share-qrcode-picture img") as HTMLImageElement
        const qrcodeContainer = this.rootE?.querySelector(".share-qrcode-picture") as HTMLElement
        const options: QRCodeToDataURLOptions = {
            width: 240,
            margin: 5,
            errorCorrectionLevel: 'M',
        }
        // QRCode.toDataURL(this.state.url, options)
        //     .then((url: string) => {
        //         qrcodeE.src = url
        //     })
        const qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "svg",
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
