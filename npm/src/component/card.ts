// import "./card.scss"
import { MDCRipple } from "@material/ripple";

export function initCard() {}

export function setupCardRipple(ele?: Element) {
    if (ele != null) {
        new MDCRipple(ele)
    }
}