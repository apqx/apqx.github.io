import {toggleClassWithEnable} from "../util/Tools";
import {initLocalRepository, LocalRepository} from "../repository/LocalRepository";
import {initTopbar} from "./topbar";
import {checkThemeColor} from "./theme";
import {initFab} from "./fab";
import {initDrawer} from "./drawer";
import {MDCRipple} from "@material/ripple";
import {MDCDataTable} from "@material/data-table";
import {initTagTriggers} from "./tag";

export function initBasic() {
    initLocalRepository()
    checkThemeColor()
    initHandwritingFont()
    initTopbar()
    initDrawer()
    initFab()
    initTagTriggers()
    initViews()
}

function initViews() {
    // 为所有的button添加ripple动画，要与 mdc-button__ripple 配合使用才会生效
    for (const ele of document.querySelectorAll(".mdc-button")) {
        // TODO: Tag弹出Dialog的React操作似乎被点击Tag的Ripple动画所影响，慢一拍，取消动画就好了，或者按住一会，等动画完成后再松开
        // 浏览器似乎是单线程运行的
        new MDCRipple(ele)
    }

    // 数据表
    for (const ele of document.querySelectorAll(".mdc-data-table")) {
        new MDCDataTable(ele)
    }
}

function initHandwritingFont() {
    const localRepository = new LocalRepository()
    const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    const bodyE = document.querySelector("body");
    toggleClassWithEnable(bodyE, "handwritten", localHandWritingFontOn)
}

