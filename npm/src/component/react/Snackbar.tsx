import "./Snackbar.scss";
import React, { useEffect, useRef } from "react";
import { MDCSnackbar } from '@material/snackbar';
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { consoleError } from "../../util/log";

interface props {
    text: string
}

export function Snackbar(props: props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const snackbar = useRef<MDCSnackbar>(null)

    useEffect(() => {
        const rootE = containerRef.current as Element
        snackbar.current = new MDCSnackbar(rootE)
        return () => {
            snackbar.current?.destroy()
        }
    }, [])

    useEffect(() => {
        // 自动关闭时间，-1 表示不自动关闭
        // snackbar.current?.timeoutMs = -1
        snackbar.current?.open()
    })

    return (
        <aside ref={containerRef} className="mdc-snackbar">
            <div className="mdc-snackbar__surface" role="status" aria-relevant="additions">
                <div className="mdc-snackbar__label" aria-atomic="false">
                    <span>{props.text}</span>
                </div>
            </div>
        </aside>
    )

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