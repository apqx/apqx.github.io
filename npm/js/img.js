import { showAlertDialog } from "./component/CommonAlertDialog"

if (document.readyState !== "loading") {
    runOnStart()
} else {
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener("DOMContentLoaded", () => {
        runOnStart()
    })
}

function runOnStart() {
    initImg()
}

function initImg() {
    const imgs = document.querySelectorAll(".clickShowOriginalImg")
    const btnCancelE = document.getElementById("img_tips_dialog_btn_close")
    let firstClick = true
    let url = ""
    for (const img of imgs) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // var hasCopyright = false
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.src.replace("_thumb", "")
            console.log("click show original img, copyright = " + hasCopyright + ", => " + url)
            if (hasCopyright && firstClick) {
                console.log("first click img, show tips dialog")
                showAlertDialog("版权声明", "点击“OK”将跳转到原始尺寸的无水印高清大图，欢迎下载分享，只是唯一注意，<b>图片版权归属作者及原剧团演员所有</b>，未经允许，不可用于商业用途🤫。",
                    "OK", () => {
                        // 必须点击这个btn才允许跳转到大图
                        firstClick = false
                        window.open(url, "_blank")
                    })
            } else {
                window.open(url, "_blank")
            }
        })
    }
}


