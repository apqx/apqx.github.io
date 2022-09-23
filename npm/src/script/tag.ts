import {EssayItemData, showTagEssayListDialog} from "./component/TagEssayListDialog";
import {console_debug, console_error} from "./util/LogUtil";

/**
 * 初始化tag的点击事件
 */
export function initTagTriggers() {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    const dialogsTriggers = document.querySelectorAll(".tag-dialog-trigger")
    // 为每一个tag添加点击监听\
    dialogsTriggers.forEach((trigger) => {
        // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
        console_debug(trigger.id)
        // 监听trigger的点击事件
        trigger.addEventListener("click", clickTag)
    })
}

function clickTag() {
    const chipId = this.id
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
    console_debug("click tag " + chipId)
    // 这里的tag可能是由&连接的多个tag
    const tag = chipId.replace("chip_tag_", "")
    showTagEssayListDialog(tag)
}

