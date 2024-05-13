// import "./post.scss"
import {consoleDebug} from "../util/log";
import highlight from "highlight.js/lib/core"
import "highlight.js/styles/atom-one-dark.css"
import {showAlertDialog} from "../component/dialog/CommonAlertDialog";
import {runOnHtmlDone} from "../util/tools";

runOnHtmlDone(() => {
    initHighLight()
    initPageCheck()
    initImgJump()
})

function initHighLight() {
    highlight.registerLanguage("bash", require("highlight.js/lib/languages/bash"))
    highlight.registerLanguage("c", require("highlight.js/lib/languages/c"))
    // highlight.registerLanguage("csharp", require("highlight.js/lib/languages/csharp"))
    highlight.registerLanguage("cpp", require("highlight.js/lib/languages/cpp"))
    highlight.registerLanguage("css", require("highlight.js/lib/languages/css"))
    highlight.registerLanguage("xml", require("highlight.js/lib/languages/xml"))
    highlight.registerLanguage("json", require("highlight.js/lib/languages/json"))
    highlight.registerLanguage("java", require("highlight.js/lib/languages/java"))
    highlight.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"))
    highlight.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"))
    highlight.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"))
    // highlight.registerLanguage("python", require("highlight.js/lib/languages/python"))
    // highlight.registerLanguage("ruby", require("highlight.js/lib/languages/ruby"))
    highlight.registerLanguage("rust", require("highlight.js/lib/languages/rust"))
    highlight.registerLanguage("scss", require("highlight.js/lib/languages/scss"))
    highlight.registerLanguage("sql", require("highlight.js/lib/languages/sql"))
    highlight.registerLanguage("shell", require("highlight.js/lib/languages/shell"))
    // highlight.registerLanguage("swift", require("highlight.js/lib/languages/swift"))
    highlight.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"))
    // highlight.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"))
    highlight.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"))
    // highlight.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"))
    highlight.registerLanguage("http", require("highlight.js/lib/languages/http"))
    // highlight.registerLanguage("dart", require("highlight.js/lib/languages/dart"))

    highlight.highlightAll()
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

function initImgJump() {
    const imgList = document.querySelectorAll(".clickShowOriginalImg")
    let firstClick = true
    let url = ""
    for (const img of imgList) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.getAttribute("src").replace("_thumb", "")
            consoleDebug("Click show original img, copyright = " + hasCopyright + ", => " + url)
            if (hasCopyright && firstClick) {
                showAlertDialog("版权声明", "点击“OK”将跳转到无水印原图，欢迎下载分享，只是注意图片版权归属作者及剧团演员所有，未经允许不可用作商业用途🤫。",
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
