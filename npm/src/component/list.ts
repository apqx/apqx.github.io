// import "./list.scss"

export function initList() {}

export function initListItem(e: HTMLElement, first: boolean, last: boolean) {
    if (first) {
        e.classList.add("mdc-deprecated-list-item__first")
    }
    if (last) {
        e.classList.add("mdc-deprecated-list-item__last")
    }
}
