import "./Snackbar.scss";
import React from "react";
import ReactDOM from "react-dom";
import { MDCSnackbar } from '@material/snackbar';
import { createRoot, Root } from "react-dom/client";
import { consoleError } from "../../util/log";

interface props {
    text: string
}

export class Snackbar extends React.Component<props, any> {
    snackbar: MDCSnackbar | null = null

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.snackbar = new MDCSnackbar(rootE)
        // 自动关闭时间
        // this.snackbar.timeoutMs = -1
        this.snackbar.open()
    }

    componentDidUpdate(prevProps: Readonly<props>, prevState: Readonly<any>, snapshot?: any): void {
        this.snackbar?.open();
    }

    render() {
        return (
            <aside className="mdc-snackbar">
                <div className="mdc-snackbar__surface" role="status" aria-relevant="additions">
                    <div className="mdc-snackbar__label" aria-atomic="false">
                        <span>{this.props.text}</span>
                    </div>
                </div>
            </aside>
        )
    }
}

var root: Root | null = null

export function showSnackbar(_text: string) {
    // 如果此时html还未加载完成，确实可能出现为null的情况
    if (document.readyState === "loading") return
    if (root == null) {
        const snackbarContainerE = document.querySelector("#snackbar_container")
        if (snackbarContainerE == null) {
            consoleError("Snackbar container not found")
            return
        }
        root = createRoot(snackbarContainerE)
    }
    root.render(
        <Snackbar text={_text} />
    )
}