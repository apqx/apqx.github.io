import {console_debug} from "./util/LogUtil";
import hljs from "highlight.js/lib/core"
import "highlight.js/styles/atom-one-dark.css"
import {showAlertDialog} from "./component/CommonAlertDialog";

export function initPost() {
    initHljs()
    initPageCheck()
    initImgJump()
}

function initHljs() {
    hljs.registerLanguage("bash", require("highlight.js/lib/languages/bash"))
    hljs.registerLanguage("c", require("highlight.js/lib/languages/c"))
    hljs.registerLanguage("csharp", require("highlight.js/lib/languages/csharp"))
    hljs.registerLanguage("cpp", require("highlight.js/lib/languages/cpp"))
    hljs.registerLanguage("css", require("highlight.js/lib/languages/css"))
    hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"))
    hljs.registerLanguage("json", require("highlight.js/lib/languages/json"))
    hljs.registerLanguage("java", require("highlight.js/lib/languages/java"))
    hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"))
    hljs.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"))
    hljs.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"))
    hljs.registerLanguage("python", require("highlight.js/lib/languages/python"))
    hljs.registerLanguage("ruby", require("highlight.js/lib/languages/ruby"))
    hljs.registerLanguage("rust", require("highlight.js/lib/languages/rust"))
    hljs.registerLanguage("scss", require("highlight.js/lib/languages/scss"))
    hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"))
    hljs.registerLanguage("shell", require("highlight.js/lib/languages/shell"))
    hljs.registerLanguage("swift", require("highlight.js/lib/languages/swift"))
    hljs.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"))
    hljs.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"))
    hljs.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"))
    hljs.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"))
    hljs.registerLanguage("http", require("highlight.js/lib/languages/http"))
    hljs.registerLanguage("dart", require("highlight.js/lib/languages/dart"))

    hljs.highlightAll()
    // document.querySelectorAll("div.highlighter-rouge").forEach(el => {
    //     hljs.highlightElement(el)
    //   })
}


/**
 * 给所有opera文章添加opera-page类，它会影响<code>的样式
 */
function initPageCheck() {
    const urlPath = window.location.pathname
    var matches = urlPath.match(/(post\/opera).*$/)
    if (matches != null && matches.length > 0) {
        console_debug("Add opera-page to body")
        document.querySelector("body").classList.add("opera-page")
    }
}

export function initImgJump() {
    const imgList = document.querySelectorAll(".clickShowOriginalImg")
    let firstClick = true
    let url = ""
    for (const img of imgList) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.getAttribute("src").replace("_thumb", "")
            console_debug("Click show original img, copyright = " + hasCopyright + ", => " + url)
            if (hasCopyright && firstClick) {
                showAlertDialog("版权声明", "点击“OK”将跳转到大尺寸无水印原图，欢迎下载分享，只是唯一注意，图片版权归属作者及剧团演员所有，未经允许不可用于商业用途🤫。",
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
