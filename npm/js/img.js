import { MDCDialog } from '@material/dialog';

if(document.readyState !== 'loading') {
    runOnStart();
} else {
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener('DOMContentLoaded', (event) => {
        runOnStart();
    });
}

function runOnStart() {
    initImg();
}

function initImg() {
    var imgs = document.querySelectorAll('.clickShowOriginalImg');
    var btnCancelE = document.getElementById('img_tips_dialog_btn_close');
    var firstClick = true;
    var url = "";
    for (const img of imgs) {
        // 点击图片，跳转到原图
        img.addEventListener('click', () => {
            var hasCopyright = img.classList.contains("operaCopyright");
            // var hasCopyright = false;
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.src.replace("_thumb", "")
            console.log("click show original img, copyright = " + hasCopyright + ", => " + url);
            if (hasCopyright && firstClick) {
                console.log("first click img, show tips dialog")
                var imgTipsDialog = new MDCDialog(document.getElementById('img_tips_dialog'));
                imgTipsDialog.listen('MDCDialog:opened', () => {
                    // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
                    // 但是Button获取焦点后颜色会变化，所以立即取消焦点
                    if (btnCancelE != null) {
                        btnCancelE.focus();
                        btnCancelE.blur();
                    }
                });
                imgTipsDialog.open();
            } else {
                window.open(url, "_blank");
            }
        });
    }
    if (btnCancelE != null) {
        btnCancelE.addEventListener('click', () => {
            // 必须点击这个btn才允许跳转到大图
            firstClick = false;
            window.open(url, "_blank");
        });
    }
}


