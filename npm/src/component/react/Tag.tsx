import { Button } from "./Button"

export interface Props { 
    text: string,
    onClick: (() => void) | null
}

export function Tag(props: Props) {

    return (
        <Button text={props.text} onClick={props.onClick} className="btn-tag" />
    )
}