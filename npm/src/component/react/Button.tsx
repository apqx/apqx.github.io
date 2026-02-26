import "./Button.scss"
import React, { useEffect, useMemo } from "react"
import { setupButtonRipple } from "../button"

export interface BtnProps {
    text: string
    onClick?: () => void;
    classes?: string[],
    tabIndex?: number;
}

export function Button(props: BtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const ele = containerRef.current as HTMLElement
        if (!ele.classList.contains("btn-tag-checkable")) {
            setupButtonRipple(ele)
        }
    }, [])

    return (
        <button ref={containerRef} type="button" className={`mdc-button ${props.classes?.join(" ") ?? ""}`.trimEnd()} tabIndex={props.tabIndex == null ? 0 : props.tabIndex}
            onClick={props.onClick}>
            <span className="mdc-button__label">{props.text}</span>
        </button>
    )
}

export interface IconBtnProps {
    icon: string
    onClick?: () => void;
    classes?: string[];
    tabIndex?: number;
}

export function IconButton(props: IconBtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)


    useEffect(() => {
        const ele = containerRef.current as HTMLElement
        setupButtonRipple(ele)
    }, [])

    return (
        <button ref={containerRef} type="button" className={`mdc-icon-button ${props.classes?.join(" ") ?? ""}`.trimEnd()} tabIndex={props.tabIndex == null ? 0 : props.tabIndex}
            onClick={props.onClick}>
            <i className="material-symbols-rounded-variable mdc-button__icon" aria-hidden="true">{props.icon}</i>
        </button>
    )
}