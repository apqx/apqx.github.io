// import "./table.scss"

export function initTable() {

    for (const tableE of document.querySelectorAll(".should-wrap-table")) {
        wrapTableByDiv(tableE)
    }
}
function wrapTableByDiv(tableE: Element) {
    const wrapper = document.createElement("div")
    wrapper.classList.add("table-wrapper")
    const innerOverflow = document.createElement("div")
    innerOverflow.classList.add("table-inner-overflow")
    wrapper.appendChild(innerOverflow)

    tableE.parentNode?.replaceChild(wrapper, tableE)
    innerOverflow.appendChild(tableE)
    tableE.classList.remove("should-wrap-table")
}

