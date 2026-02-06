import "./Button.scss"
import React, { useEffect } from "react"
import { clearFocusListener } from "../../util/tools"
import { setupButtonRipple } from "../button"

export interface BtnProps {
    text: string
    onClick: (() => void) | null;
    className: string;
}

export function Button(props: BtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const ele = containerRef.current as HTMLElement

        setupButtonRipple(ele)
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

export interface IconBtnProps {
    icon: string
    onClick: (() => void) | null;
    className: string;
}

export function IconButton(props: IconBtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const ele = containerRef.current as HTMLElement

        setupButtonRipple(ele)
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
        <button ref={containerRef} type="button" className="mdc-icon-button" tabIndex={-1}>
            <i className="material-symbols-rounded-light mdc-button__icon" aria-hidden="true">{props.icon}</i>
        </button>
    )
}