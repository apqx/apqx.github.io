import {MDCRipple} from "@material/ripple";
// import "./button.scss"

export function initButton() {
    // 为所有的button添加ripple动画
    for (const ele of document.querySelectorAll(".mdc-button:not(.btn-tag)")) {
        new MDCRipple(ele)
    }
}
