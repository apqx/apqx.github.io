import { useCallback, useEffect, useState } from "react"
import { ButtonVariant } from "./Button"

export interface Props {
    text: string,
    description?: string,
    checked: boolean,
    onClick: ((checked: boolean) => void) | null
}

export function CheckableChip(props: Props) {
    const [checked, setChecked] = useState(props.checked) 

    useEffect(() => {
        setChecked(props.checked)
    }, [props.checked])

    const onClick = useCallback(() => {
        const newChecked = !checked
        setChecked(newChecked)
        if (props.onClick != null) {
            props.onClick(newChecked)
        }
    }, [checked, props.onClick])

    return (
        <ButtonVariant text={props.text} description={props.description} onClick={onClick} classes={checked ? ["mdm-chip", "mdm-chip-checkable", "mdm-chip-checked"] : ["mdm-chip", "mdm-chip-checkable"]} />
    )
}