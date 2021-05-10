// 处理文章的tag标记

import { MDCList } from '@material/list';
import { MDCDialog } from '@material/dialog';


// tag对应的Dialog
// 获取每一个标记了dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
const dialogsTriggers = document.querySelectorAll('.dialog-trigger');
for (const triger of dialogsTriggers) {
    // 获取每一个triger的id，找到它对应的dialogId，和dialog里的listId
    // chip_tag_随笔 dialog_随笔 dialog_list_随笔
    const dialogId = triger.id.replace("chip_tag_", "dialog_");
    const listId = triger.id.replace("chip_tag_", "dialog_list_");
    console.log(triger.id + " : " + dialogId + " : " + listId);
    // 监听trigger的点击事件
    triger.addEventListener('click', () => {
        console.log("click tag " + triger.id);
        const dialog = new MDCDialog(document.getElementById(dialogId));
        dialog.open();
        const list = new MDCList(document.getElementById(listId));
        // 监听dialog的弹出事件
        dialog.listen('MDCDialog:opened', () => {
            console.log("tag dialog opened " + triger.id);
            // list.layout();
            // TODO：这里应检测当前文章，并在列表中选中
            list.selectedIndex = 1
        });
        // 点击列表中的item后，关闭Dialog
        list.listen('MDCList:clicked', () => {
            console.log("click tagList item");
        });
    });
}