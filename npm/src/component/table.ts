// import "./table.scss"
import { MDCDataTable } from "@material/data-table"

export function initTable() {

    for (const ele of document.querySelectorAll(".mdc-data-table")) {
        new MDCDataTable(ele)
    }

    for (const tableE of document.querySelectorAll(".should-wrap-table")) {
        wrapTableByDiv(tableE)
    }
}
function wrapTableByDiv(tableE: Element) {
    const wrapper = document.createElement("div")
    wrapper.classList.add("table-wrapper")
    tableE.parentNode?.replaceChild(wrapper, tableE)
    wrapper.appendChild(tableE)
    tableE.classList.remove("should-wrap-table")
}

