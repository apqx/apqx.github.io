import "./post.scss"
import { consoleDebug, consoleError } from "../util/log"
import { runOnHtmlDone } from "../util/tools"
import { initContentCard } from "../component/contentCard"
import { showAlertDialog } from "../component/dialog/CommonAlertDialog"
import { showSnackbar } from "../component/react/Snackbar"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_SHARE } from "../base/constant"
import { initShareList } from "../component/react/ShareList"

export function initPost() {
    runOnHtmlDone(() => {
        initContentCard(true)
        initCodeHighlight()
        initPageCheck()
        initImgJump()
        initImg()
    })
}

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
    var sectionIdentifier = getSectionTypeByPath(urlPath).identifier
    consoleDebug("Post page section = " + sectionIdentifier + ", path = " + urlPath)
    if (sectionIdentifier === SECTION_TYPE_OPERA.identifier) {
        consoleDebug("Add opera-page to body")
        document.body.classList.add("opera-page")
    } else if (sectionIdentifier === SECTION_TYPE_SHARE.identifier) {
        consoleDebug("Init share page")
        initShareList()
    }
    
}

function initImgJump() {
    const imgList = document.querySelectorAll(".clickShowOriginalImg")
    let url = ""
    for (const img of imgList) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
            url = img.getAttribute("src")!!.replace("_thumb", "")
            consoleDebug("Click show original img, copyright = " + hasCopyright + ", => " + url)
            if (hasCopyright) {
                showCopyrightDialog(url);
            } else {
                window.open(url, "_blank")
            }
        })
    }
}

function showCopyrightDialog(url: string) {
    showAlertDialog("版权声明", "点击“OK”将跳转到无水印原图，注意图片版权归属作者及剧团演员所有，未经允许不可作商业用途🤫。",
        "OK", () => {
            // 必须点击这个btn才允许跳转到大图
            window.open(url, "_blank")
        })
}

function initImg() {
    // 右键点击图片时，阻止弹出默认的右键菜单，而是弹出自定义提示
    document.addEventListener("contextmenu", (event) => {
        if (event.target instanceof HTMLImageElement) {
            event.preventDefault();
            // showAlertDialog("提示", "节省数据流量文中是缩略图，点击图片可以跳转到原图。", "OK", () => { })
            showSnackbar("节省数据文中是缩略图，点击图片可跳转到原图")
        }
    })
}

function inidShareList() {
    throw new Error("Function not implemented.")
}
