import "./Button.scss"
import React, { useEffect, useMemo } from "react"
import { clearFocusListener } from "../../util/tools"
import { setupButtonRipple } from "../button"

export interface BtnProps {
    text: string
    onClick: (() => void) | null;
    classes: string[];
}

export function Button(props: BtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)
    const onClick = useMemo(() => {
        return props.onClick
    }, [props.onClick])

    useEffect(() => {
        const ele = containerRef.current as HTMLElement
        setupButtonRipple(ele)

        const onClickListener = () => {
            if (onClick != null) {
                onClick()
            }
        }

        ele.addEventListener("click", onClickListener)
        // ele.addEventListener("focus", clearFocusListener)
        return () => {
            ele.removeEventListener("click", onClickListener)
            // ele.removeEventListener("focus", clearFocusListener)
        }
    }, [])

    return (
        <button ref={containerRef} type="button" className={`mdc-button ${props.classes.join(" ")}`} tabIndex={0}>
            <span className="mdc-button__label">{props.text}</span>
        </button>
    )
}

export interface IconBtnProps {
    icon: string
    onClick: (() => void) | null;
    classes: string[];
}

export function IconButton(props: IconBtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)
    const onClick = useMemo(() => {
        return props.onClick
    }, [props.onClick])

    useEffect(() => {
        const ele = containerRef.current as HTMLElement

        setupButtonRipple(ele)
        const onClickListener = () => {
            if (onClick != null) {
                onClick()
            }
        }

        ele.addEventListener("click", onClickListener)
        // ele.addEventListener("focus", clearFocusListener)
        return () => {
            ele.removeEventListener("click", onClickListener)
            // ele.removeEventListener("focus", clearFocusListener)
        }
    }, [])

    return (
        <button ref={containerRef} type="button" className={`mdc-icon-button ${props.classes.join(" ")}`} tabIndex={0}>
            <i className="material-symbols-rounded-variable mdc-button__icon" aria-hidden="true">{props.icon}</i>
        </button>
    )
}