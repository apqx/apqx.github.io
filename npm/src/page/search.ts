import {MDCRipple} from "@material/ripple";
import {MDCTextField} from "@material/textfield";
import {ProgressLinear} from "../component/react/ProgressLinear";
import {MDCList} from "@material/list";
import "./search.scss"

export function initSearch() {
    document.querySelectorAll("#btn-search").forEach(e => {
        new MDCRipple(e)
    })
    document.querySelectorAll("#search-page_label").forEach(e => {
        const inputE = e.querySelector("input")
        new MDCTextField(e)
        // e.addEventListener("keyup", (event: KeyboardEvent) => {
            // if (event.key === "Enter")
                // this.onClickSearch()
        // })
    })
}
