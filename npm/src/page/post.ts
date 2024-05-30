// import "./post.scss"
import { consoleDebug, consoleError } from "../util/log";
import { runOnHtmlDone, runOnPageDone } from "../util/tools";
import { initContentCard } from "../component/contentCard";
import { showAlertDialog } from "../component/dialog/CommonAlertDialog";

runOnHtmlDone(() => {
    initContentCard(true)
    initCodeHighlight()
    initPageCheck()
    initImgJump()
})

function initCodeHighlight() {
    if (document.querySelector("pre code") == null) return
    import("../component/codeHighlight").then((codeHighlight) => {
        codeHighlight.init()
    }).catch((e) => {
        consoleError(e)
    })
}

/**
 * 给所有opera文章添加opera-page类，它会影响<code>的样式
 */
function initPageCheck() {
    const urlPath = window.location.pathname
    var matches = urlPath.match(/(post\/opera).*$/)
    if (matches != null && matches.length > 0) {
        consoleDebug("Add opera-page to body")
        document.querySelector("body").classList.add("opera-page")
    }
}

let copyrightImgClicked = false

function initImgJump() {
    const imgList = document.querySelectorAll(".clickShowOriginalImg")
    let url = ""
    for (const img of imgList) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.getAttribute("src").replace("_thumb", "")
            consoleDebug("Click show original img, copyright = " + hasCopyright + ", => " + url)
            if (hasCopyright && !copyrightImgClicked) {
                showCopyrightDialog(url);
            } else {
                window.open(url, "_blank")
            }
        })
    }
}

function showCopyrightDialog(url: string) {
    showAlertDialog("版权声明", "点击“OK”将跳转到无水印原图，欢迎下载分享，只是注意图片版权归属作者及剧团演员所有，未经允许不可用作商业用途🤫。",
        "OK", () => {
            // 必须点击这个btn才允许跳转到大图
            copyrightImgClicked = true
            window.open(url, "_blank")
        })
}
