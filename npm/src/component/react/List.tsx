import { useEffect, useMemo, useRef } from "react"
import "./List.scss"
import { setupListItemRipple } from "../list"

export type ListItem = {
    title: string,
    description?: string,
    link?: string,
    newPage?: boolean,
}

interface Props {
    oneLine: boolean,
    items: ListItem[],
    classes?: string[],
}

export function List(props: Props) {

    const classList = useMemo(() => {
        const base = ["mdc-deprecated-list"]
        if (props.oneLine) {
            base.push("mdc-deprecated-list--one-line")
        }
        if (props.classes) {
            base.push(...props.classes)
        }
        return base.join(" ")
    }, [props.oneLine, props.classes])

    return (
        <ul className={classList}>
            {props.items.map((item, index) => (
                <ListItem key={item.title} item={item} last={index === props.items.length - 1} />
            ))}

        </ul>
    )
}

interface ListItemProps {
    item: ListItem,
    last: boolean,
}

function ListItem(props: ListItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        const rootE = containerRef.current as HTMLElement;
        const liE = rootE.querySelector(".mdc-deprecated-list-item") as HTMLElement
        setupListItemRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            {/* 禁止列表自动获取焦点，可能导致 dialog 关闭时意外滚动到焦点位置 */}
            <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken" href={props.item.link} target={props.item.newPage ? "_blank" : "_self"} tabIndex={-1}>
                <div className="mdc-deprecated-list-item__text">
                    <div className="list-item__primary-text">{props.item.title}</div>
                    <div className="list-item__secondary-text">
                        {props.item.description}
                    </div>
                </div>
            </a>
            {!props.last && <hr className="mdc-deprecated-list-divider" />}
        </li>
    )
}

