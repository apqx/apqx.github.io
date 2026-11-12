import { MDCRipple } from "@material/ripple"
import "./ripple.scss"

export function setupRipple(ele: HTMLElement | null) {
    if (ele) {
        const ripple = new MDCRipple(ele)
        ripple.unbounded = false
    }
}
