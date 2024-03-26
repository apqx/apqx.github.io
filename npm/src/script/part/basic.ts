import {initLocalRepository} from "../repository/LocalRepository";
import {initTopbar} from "./topbar";
import {initFab} from "./fab";
import {initDrawer} from "./drawer";
import {MDCDataTable} from "@material/data-table";
import {initTag, initTagTriggers} from "./tag";
import {initHandwritingFont} from "./font";

export function initBasic() {
    initLocalRepository()
    initHandwritingFont()
    initTopbar()
    initDrawer()
    initFab()
    initTag()
    initTagTriggers()
    initViews()
}

function initViews() {
    // 数据表
    for (const ele of document.querySelectorAll(".mdc-data-table")) {
        new MDCDataTable(ele)
    }
}
