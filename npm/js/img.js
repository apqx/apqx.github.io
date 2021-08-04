import { MDCDialog } from '@material/dialog';

const imgs = document.querySelectorAll('.clickShowOriginalImg');
var firstClick = true;
for (const img of imgs) {
    // var hasCopyright = img..hasClass("copyright");
    var hasCopyright = false;
    // 点击图片，跳转到原图
    img.addEventListener('click', () => {
        var url = img.src;
        // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
        url = url.replace("_thumb", "")
        console.log("click show original img, copyright = " + hasCopyright + ", => " + url);
        if (hasCopyright && firstClick) {
            console.log("first click img, show tips dialog")
            const imgTipsDialog = new MDCDialog(document.getElementById('img_tips_dialog'));
            imgTipsDialog.listen('MDCDialog:opened', () => {
                // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
                // 但是Button获取焦点后颜色会变化，所以立即取消焦点
                document.getElementById('img_tips_dialog_btn_close').focus();
                document.getElementById('img_tips_dialog_btn_close').blur();
            });
            
            imgTipsDialog.open();
            document.getElementById('img_tips_dialog_btn_close').addEventListener('click', () => {
                // 必须点击这个btn才允许跳转到大图
                firstClick = false;
                window.open(url, "_blank");
            });
        } else {
            window.open(url, "_blank");
        }
    });
}

