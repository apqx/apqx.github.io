import { useCallback, useEffect, useState } from "react"
import { Button } from "./Button"

export interface Props {
    text: string,
    checked: boolean,
    onClick: ((checked: boolean) => void) | null
}

export function CheckableTag(props: Props) {
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
    }, [])

    return (
        <Button text={props.text} onClick={onClick} classes={checked ? ["btn-tag", "btn-tag-checked"] : ["btn-tag"]} />
    )
}