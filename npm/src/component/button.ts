// import "./button.scss"
import { MDCRipple } from "@material/ripple";

export function initButton() {
    // 为所有的button添加ripple动画
    for (const ele of document.querySelectorAll(".mdc-button:not(.btn-tag)")) {
        setupButtonRipple(ele)
    }
}

export function setupButtonRipple(ele: Element | null) {
    if (ele != null) {
        new MDCRipple(ele)
    }
}

export function setupIconButtonRipple(ele: Element | null) {
    if (ele != null) {
        const ripple = new MDCRipple(ele)
        ripple.unbounded = true
    }
}
