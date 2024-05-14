import {MDCDataTable} from "@material/data-table";
// import "./table.scss"

export function initTable() {

    for (const ele of document.querySelectorAll(".mdc-data-table")) {
        new MDCDataTable(ele)
    }
}
