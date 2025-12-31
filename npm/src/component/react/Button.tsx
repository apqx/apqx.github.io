import "./Button.scss"
import { MDCRipple } from "@material/ripple"
import React, { useEffect } from "react"
import { clearFocusListener } from "../../util/tools"

export interface Props {
    text: string
    onClick: (() => void) | null;
    className: string;
}

export function Button(props: Props) {
    const containerRef = React.useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const ele = containerRef.current as HTMLElement

        new MDCRipple(ele)
        if (props.className != null && props.className.length > 0) {
            const classes = props.className.split(" ")
            classes.forEach((c) => {
                ele.classList.add(c)
            })
        }
        if (props.onClick != null) {
            ele.addEventListener("click", props.onClick)
        }
        ele.addEventListener("focus", clearFocusListener)
    }, [])

    return (
        <button ref={containerRef} type="button" className="mdc-button" tabIndex={-1}>
            <span className="mdc-button__label">{props.text}</span>
        </button>
    )
}