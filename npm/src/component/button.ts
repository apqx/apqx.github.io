// import "./button.scss"
import { MDCRipple } from "@material/ripple";

export function initButton() {
    // 为所有 button 添加 ripple 动画
    for (const ele of document.querySelectorAll(".mdc-button:not(.btn-tag)")) {
        setupButtonRipple(ele)
    }
}

export function setupButtonRipple(ele?: Element) {
    if (ele != null) {
        const ripple = new MDCRipple(ele)
        // TODO: ripple 边界需要详细探究，不要随意更改
        // 为什么这里是 false ？
        ripple.unbounded = false
    }
}

export function setupIconButtonRipple(ele?: Element) {
    if (ele != null) {
        // ripple 不超出元素尺寸边界，已在 IconButton 中确认
        const ripple = new MDCRipple(ele)
        ripple.unbounded = true
    }
}
