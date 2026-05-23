import "./TextField.scss"
import { useEffect, useRef } from "react"
import { IconButton } from "./Button"
import { MDCTextField } from "@material/textfield/component"

interface TextFieldProps {
    label: string
    hint: string
    classes?: string[]
    onChange: (value: string) => void
    tabIndex?: number
    icon?: string
    onClickIcon?: () => void
}

export function TextField(props: TextFieldProps) {
    const containerRef = useRef<HTMLLabelElement>(null)
    const textFieldRef = useRef<MDCTextField>(null)

    useEffect(() => {
        textFieldRef.current = new MDCTextField(containerRef.current as HTMLElement)
        const keyListener = (event: KeyboardEvent) => {
            if (event.key === "Enter")
                props.onClickIcon?.()
        }
        containerRef.current?.addEventListener("keyup", keyListener)

        return () => {
            containerRef.current?.removeEventListener("keyup", keyListener)
            textFieldRef.current?.destroy()
        }
    }, [])

    return (
        <label ref={containerRef} className={`mdc-text-field mdc-text-field--outlined ${props.classes?.join(" ") ?? ""}`.trimEnd()}>
            <span className="mdc-notched-outline">
                <span className="mdc-notched-outline__leading"></span>
                <span className="mdc-notched-outline__notch">
                    <span className="mdc-floating-label">{props.label}</span>
                </span>
                <span className="mdc-notched-outline__trailing"></span>
            </span>
            {/* 这里禁止自动获取焦点，可能导致 dialog 意外滚动到焦点位置 */}
            <input type="search" className="mdc-text-field__input" aria-labelledby="input-label" tabIndex={props.tabIndex ?? -1} />
            {props.icon &&
                <IconButton icon={props.icon} onClick={props.onClickIcon} classes={["text-field__icon"]} tabIndex={-1} />
            }
        </label>
    )
}