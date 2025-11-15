// import "./list.scss"

import { toggleClassWithEnable } from "../util/tools"

export function initList() { }

export function initListItem(e: HTMLElement, first: boolean, last: boolean) {
    toggleClassWithEnable(e, "list-first", first)
    toggleClassWithEnable(e, "list-last", last)
}
