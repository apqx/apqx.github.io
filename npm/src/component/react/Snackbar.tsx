import "./Snackbar.scss";
import React from "react";
import type { RefObject } from "react";
import { MDCSnackbar } from '@material/snackbar';
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { consoleError } from "../../util/log";

interface props {
    text: string
}

export class Snackbar extends React.Component<props, any> {
    private containerRef: RefObject<HTMLDivElement | null> = React.createRef()
    snackbar: MDCSnackbar | null = null

    componentDidMount(): void {
        const rootE = this.containerRef.current as Element
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
            <aside ref={this.containerRef} className="mdc-snackbar">
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