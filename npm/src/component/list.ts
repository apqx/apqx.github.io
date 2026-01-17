// import "./list.scss"
import { MDCRipple } from "@material/ripple"
import { toggleClassWithEnable } from "../util/tools"

export function initList() { }

export function initListItem(e: HTMLElement, first: boolean, last: boolean) {
    toggleClassWithEnable(e, "list-first", first)
    toggleClassWithEnable(e, "list-last", last)
}

export function setupListItemRipple(ele: Element | null) { 
    if (ele != null) {
        new MDCRipple(ele)
    }
 }
