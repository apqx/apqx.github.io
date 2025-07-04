// import "./tag.scss"
import { MDCRipple } from "@material/ripple"
import { consoleDebug } from "../util/log"
import { showTagDialog } from "./dialog/TagDialog"
import { clearFocusListener } from "../util/tools"

/**
 * 初始化tag的点击事件
 */
export function initTagTriggers(containerE: HTMLElement = document.body) {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    const dialogsTriggers = containerE.querySelectorAll(".tag-dialog-trigger:not(#index-list-wrapper .tag-dialog-trigger)")
    // 为每一个tag添加点击监听
    dialogsTriggers.forEach((trigger) => {
        setupTagTrigger(trigger as HTMLElement)
    })
}

export function setupTagTrigger(trigger: HTMLElement) {
    // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
    consoleDebug("Tag trigger id " + trigger.id)
    // 监听trigger的点击事件
    trigger.addEventListener("click", (event) => {
        // TODO: 如果tag是button，弹出的dialog消失后会重新获取焦点
        // (event.target as HTMLElement).blur()
        const chipId = trigger.id
        // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
        // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
        consoleDebug("Click tag " + chipId)
        // 这里的tag可能是由&连接的多个tag
        const tag = chipId.replace("chip_tag_", "")
        showTagDialog(tag)
    })
}

export function initTag() {
    for (const ele of document.querySelectorAll(".mdc-button.btn-tag")) {
        new MDCRipple(ele)
        ele.addEventListener("focus", clearFocusListener)
    }
}

