// import "./list.scss"

import { toggleClassWithEnable } from "../util/tools"

export function initList() { }

export function initListItem(e: HTMLElement, first: boolean, last: boolean) {
    toggleClassWithEnable(e, "mdc-deprecated-list-item__first", first)
    toggleClassWithEnable(e, "mdc-deprecated-list-item__last", last)
}
