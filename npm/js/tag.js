// 处理文章的tag标记

import { MDCList } from '@material/list';
import { MDCDialog } from '@material/dialog';


// tag对应的Dialog
// 获取每一个标记了dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
const dialogsTriggers = document.querySelectorAll('.dialog-trigger');

try {
    for (const triger of dialogsTriggers) {
        // 获取每一个triger的id，找到它对应的dialogId，和dialog里的listId
        // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
        const dialogId = triger.id.replace("chip_tag_", "dialog_tag_");
        const listId = triger.id.replace("chip_tag_", "dialog_tag_list_");
        const btnId = triger.id.replace("chip_tag_", "btn_tag_dialog_close_");
        console.log(triger.id + " : " + dialogId + " : " + listId);
        // 监听trigger的点击事件
        triger.addEventListener('click', () => {
            console.log("click tag " + triger.id);
            const dialog = new MDCDialog(document.getElementById(dialogId));
            dialog.open();
            const listEl = document.getElementById(listId);
            const list = new MDCList(listEl);
            // 监听dialog的弹出事件
            dialog.listen('MDCDialog:opened', () => {
                console.log("tag dialog opened " + triger.id);
                // list.layout();
                // Dialog弹出时似乎Button获取了焦点，应该取消
                document.getElementById(btnId).blur();
            });
            // 点击列表中的item后，关闭Dialog
            list.listen('MDCList:action', (event) => {
                console.log("click tagList item");
                dialog.close();
            });
        });
    }
} catch (e) {
    console.log("tag catche e = " + e.message);
}
