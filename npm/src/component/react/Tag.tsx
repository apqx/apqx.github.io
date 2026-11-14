import { Button } from "./Button"

export interface Props { 
    text: string,
    onClick?: (() => void)
}

export function Tag(props: Props) {

    return (
        <Button text={props.text} onClick={props.onClick} classes={["mdm-chip"]} tabIndex={-1} />
    )
}