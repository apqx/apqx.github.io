import "./List.scss"
import { useEffect, useMemo, useRef } from "react"
import { setupRipple } from "../ripple"

interface ListProps {
    oneLine: boolean,
    items: ListItemProps[],
    classes?: string[],
    noHover?: boolean
}

export function List(props: ListProps) {

    const classList = useMemo(() => {
        const base = ["mdm-list"]
        if (props.oneLine) {
            base.push("mdm-list--one-line")
        }
        if (props.noHover) {
            base.push("mdm-list-no-hover")
        }
        if (props.classes) {
            base.push(...props.classes)
        }
        return base.join(" ")
    }, [props.oneLine, props.classes, props.noHover])

    return (
        <ul className={classList}>
            {props.items.map((item, _index) => (
                <ListItem key={item.title} title={item.title} description={item.description} link={item.link} newPage={item.newPage} />
            ))}

        </ul>
    )
}

interface ListItemProps {
    title: string,
    description?: string,
    link?: string,
    newPage?: boolean,
}

function ListItem(props: ListItemProps) {
    const linkRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        setupRipple(linkRef.current)
    }, [])

    return (
        <li ref={linkRef}>
            {/* 禁止列表自动获取焦点，可能导致 dialog 关闭时意外滚动到焦点位置 */}
            <a className={"mdm-list-item mdm-list-item-darken"} href={props.link} target={props.newPage ? "_blank" : "_self"} tabIndex={-1}>
                <div className="mdm-list-item__text">
                    <div className="mdm-list-item__primary-text">{props.title}</div>
                    <div className="mdm-list-item__secondary-text">
                        {props.description}
                    </div>
                </div>
            </a>
        </li>
    )
}

