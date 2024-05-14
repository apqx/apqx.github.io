import {MDCRipple} from "@material/ripple";
import {consoleDebug} from "../util/log";
import {showTagEssayListDialog} from "./dialog/TagEssayListDialog";
// import "./tag.scss"

/**
 * 初始化tag的点击事件
 */
export function initTagTriggers() {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    const dialogsTriggers = document.querySelectorAll(".tag-dialog-trigger")
    // 为每一个tag添加点击监听
    dialogsTriggers.forEach((trigger) => {
        // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
        consoleDebug(trigger.id)
        // 监听trigger的点击事件
        trigger.addEventListener("click", clickTag)
    })
}

function clickTag(event: Event) {
    // TODO: 如果tag是button，弹出的dialog消失后会重新获取焦点
    // (event.target as HTMLElement).blur()
    const chipId = this.id
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
    consoleDebug("Click tag " + chipId)
    // 这里的tag可能是由&连接的多个tag
    const tag = chipId.replace("chip_tag_", "")
    showTagEssayListDialog(tag)
}

export function initTag() {
    // 为所有的button添加ripple动画
    for (const ele of document.querySelectorAll(".mdc-button.btn-tag")) {
        // TODO: Tag弹出Dialog的React操作似乎被点击Tag的Ripple动画所影响，慢一拍，取消动画就好了，或者按住一会，等动画完成后再松开
        // 浏览器是单线程运行的
        new MDCRipple(ele)
    }
}

