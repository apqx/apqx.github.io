import { MDCRipple } from "@material/ripple"
import "./ripple.scss"

export function setupRipple(ele: HTMLElement | null) {
    if (ele) {
        new MDCRipple(ele)
    }
}
