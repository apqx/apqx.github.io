// import "./list.scss"
import { MDCRipple } from "@material/ripple"
import { toggleElementClass } from "../util/tools"

export function initList() { }

export function initListItem(e: HTMLElement, first: boolean, last: boolean) {
    toggleElementClass(e, "list-first", first)
    toggleElementClass(e, "list-last", last)
}

export function setupListItemRipple(ele?: Element) { 
    if (ele != null) {
        new MDCRipple(ele)
    }
 }
