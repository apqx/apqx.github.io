import "./post.scss"
import { consoleInfo, consoleError } from "../util/log"
import { isAndroidModern, runOnHtmlDone } from "../util/tools"
import { initContentCard } from "../component/contentCard"
import { showAlertDialog } from "../component/dialog/CommonAlertDialog"
import { showSnackbar } from "../component/react/Snackbar"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_SHARE } from "../base/constant"
import { initShares } from "../component/react/LinearShares"

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
 * 给所有 opera 文章添加 opera-page 类，它会影响 <code> 样式
 */
function initPageCheck() {
    const urlPath = window.location.pathname
    var sectionIdentifier = getSectionTypeByPath(urlPath).identifier
    consoleInfo("Post page section = " + sectionIdentifier + ", path = " + urlPath)
    if (sectionIdentifier === SECTION_TYPE_OPERA.identifier) {
        consoleInfo("Add opera-page to body")
        document.body.classList.add("opera-page")
    } else if (sectionIdentifier === SECTION_TYPE_SHARE.identifier) {
        consoleInfo("Init share page")
        initShares()
    }

}

function initImgJump() {
    const imgList = document.querySelectorAll(".clickShowOriginalImg")
    for (const img of imgList) {
        // 点击图片，跳转到原图
        img.addEventListener("click", () => {
            const hasCopyright = img.classList.contains("operaCopyright")
            // 所有的图片的缩略图都加 _thumb 后缀，删除后即为原图
            // 图片只有 3 种格式，jpg、avif 和 webp
            // 命名示例：abcd_thumb.jpg abcd_thumb_jpg.webp abcd_thumb_for_lens_jpg.webp
            // _thumb: 缩略图标识
            // _for_lens: 透镜分区标识，表明此缩略图是为透镜分区准备的
            // _for_cover: 封面标识，表明此缩略图是为封面准备的
            // 原图后缀名标识必须放在文件名尾部
            // _jpg: 原图后缀名标识，默认缩略图和原图为相同格式。若缩略图是 webp 原图是 jpg 需加此标识
            // _avif: 原图后缀名标识，默认缩略图和原图为相同格式。若缩略图是 webp 原图是 avif 需加此标识
            let imgUrl = img.getAttribute("src")!!
            // 如果是缩略图，获取其原图 URL
            if (imgUrl.includes("_thumb")) {
                let urlWithoutSuffix = imgUrl.substring(0, imgUrl.lastIndexOf("."))
                // 删除 thumb 之后尾部的原图后缀名标记
                if (urlWithoutSuffix.endsWith("_jpg")) {
                    imgUrl = urlWithoutSuffix.substring(0, urlWithoutSuffix.length - "_jpg".length) + ".jpg"
                } else if (urlWithoutSuffix.endsWith("_avif")) {
                    imgUrl = urlWithoutSuffix.substring(0, urlWithoutSuffix.length - "_avif".length) + ".avif"
                } else if (urlWithoutSuffix.endsWith("_webp")) {
                    imgUrl = urlWithoutSuffix.substring(0, urlWithoutSuffix.length - "_webp".length) + ".webp"
                }
                // 删除缩略图标记和缩略图用途标记
                imgUrl = imgUrl.replace("_thumb", "").replace("_for_lens", "").replace("_for_cover", "")
            }
            
            consoleInfo("Click show original img, copyright = " + hasCopyright + ", => " + imgUrl)
            if (hasCopyright) {
                showCopyrightDialog(imgUrl);
            } else {
                window.open(imgUrl, "_blank")
            }
        })
    }   
}

function showCopyrightDialog(url: string) {
    const formatHint = url.endsWith(".avif") && isAndroidModern() ? "原图为 P3 色域 AVIF 文件，在部分 Android 设备的图库中可能颜色偏淡。<br/>" : ""
    showAlertDialog("版权声明", formatHint + "点击“跳转”将打开无水印原图，注意图片版权归属作者及剧团演员所有，未经允许不可作商业用途🤫。",
        "取消", undefined,
        "跳转", () => {
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
