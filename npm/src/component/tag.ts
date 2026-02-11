// import "./tag.scss"
import { consoleDebug } from "../util/log"
import { showTagDialog } from "./dialog/TagDialog"
import { clearFocusListener } from "../util/tools"
import { setupButtonRipple } from "./button"

/**
 * 初始化 tag 的点击事件
 */
export function initTagTriggers(containerE: HTMLElement = document.body) {
    const dialogsTriggers = containerE.querySelectorAll(".tag-dialog-trigger:not(#index-list-wrapper .tag-dialog-trigger)")
    dialogsTriggers.forEach((trigger) => {
        setupTagTrigger(trigger as HTMLElement)
    })
}

export function setupTagTrigger(trigger: HTMLElement) {
    // 获取每一个 trigger 的 id，找到它对应的 dialogId，和 dialog 里的 listId
    consoleDebug("SetupTagTrigger " + trigger.id)
    // 监听 trigger 的点击事件
    trigger.addEventListener("click", (event) => {
        onTagTriggerClick(trigger)
    })
}

export function onTagTriggerClick(trigger: HTMLElement) {
    // TODO: 如果 tag 是 button，弹出的 dialog 消失后会重新获取焦点
    // (event.target as HTMLElement).blur()
    const tagId = trigger.id
    const nickname = trigger.getAttribute("nickname") ?? undefined
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎念&看剧 可以指定多个 tag，用 & 分隔
    consoleDebug("Click tag " + tagId)
    // 这里的 tag 可能是由&连接的多个 tag
    const tag = tagId.replace("chip_tag_", "")
    showTagDialog(tag, nickname)
}

export function initTag() {
    for (const ele of document.querySelectorAll(".mdc-button.btn-tag")) {
        setupButtonRipple(ele)
        ele.addEventListener("focus", clearFocusListener)
    }
}

