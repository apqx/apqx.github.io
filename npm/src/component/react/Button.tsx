import "./Button.scss"
import React, { useEffect, useRef } from "react"
import { setupButtonRipple, setupIconButtonRipple } from "../button"
import type { IAnimationController } from "../animation/IAnimationController";
import { AnimationController } from "../animation/AnimationController";

export interface BtnProps {
    text: string
    onClick?: () => void
    classes?: string[]
    tabIndex?: number
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
    onClick?: () => void
    classes?: string[]
    tabIndex?: number
}

export function IconButton(props: IconBtnProps) {
    const containerRef = React.useRef<HTMLButtonElement>(null)

    useEffect(() => {
        setupIconButtonRipple(containerRef.current as HTMLSpanElement)
    }, [])

    return (
        <button ref={containerRef} type="button" className={`mdc-icon-button ${props.classes?.join(" ") ?? ""}`.trimEnd()} tabIndex={props.tabIndex == null ? 0 : props.tabIndex}
            onClick={props.onClick}>
            <i className="material-symbols-rounded-variable mdc-button__icon" aria-hidden="true">{props.icon}</i>
        </button>
    )
}

export interface ToggleIconButtonProps {
    iconOff: string
    iconOn: string
    on: boolean
    onClick?: () => void
    classes?: string[]
    tabIndex?: number
}

export function ToggleIconButton(props: ToggleIconButtonProps) {
    const containerRef = useRef<HTMLButtonElement>(null)
    const iconOffRef = useRef<HTMLElement>(null)
    const iconOnRef = useRef<HTMLElement>(null)
    const iconOffAnimationControllerRef = useRef<IAnimationController>(null)
    const iconOnAnimationControllerRef = useRef<IAnimationController>(null)

    useEffect(() => {
        const ele = containerRef.current as HTMLElement
        setupIconButtonRipple(ele)
        iconOffAnimationControllerRef.current = new AnimationController(iconOffRef.current, "fade")
        iconOnAnimationControllerRef.current = new AnimationController(iconOnRef.current, "fade")
        return () => {
            iconOffAnimationControllerRef.current?.destroy()
            iconOnAnimationControllerRef.current?.destroy()
        }
    }, [])

    useEffect(() => {
        iconOffAnimationControllerRef.current?.toggleOpen(!props.on)
        iconOnAnimationControllerRef.current?.toggleOpen(props.on)
    }, [props.on])

    return (
        <button ref={containerRef} type="button" className={`mdm-toggle-icon-button mdc-icon-button ${props.classes?.join(" ") ?? ""}`.trimEnd()} tabIndex={props.tabIndex == null ? 0 : props.tabIndex}
            onClick={props.onClick}>
            <i ref={iconOffRef} className="material-symbols-rounded-variable mdc-button__icon fade" aria-hidden="true">{props.iconOff}</i>
            <i ref={iconOnRef} className="material-symbols-rounded-variable mdc-button__icon fade" aria-hidden="true">{props.iconOn}</i>
        </button>
    )
}