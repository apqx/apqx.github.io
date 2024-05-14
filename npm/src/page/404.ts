// import "./404.scss"
import {showShortLinkJumpDialog} from "../component/dialog/ShortLinkJumpDialog";
import {consoleDebug} from "../util/log";
import {runOnHtmlDone, runOnPageDone} from "../util/tools";
import {initContentCard} from "../component/contentCard";

runOnHtmlDone(() => {
    initContentCard()
})

runOnPageDone(() => {
    checkJump()
})

/**
 * 进入页面，检查是否携带了跳转参数
 * https://mudan.me/pid
 */
function checkJump() {
    let pid = null
    const urlPath = window.location.pathname
    consoleDebug("Url path = " + urlPath)
    // https://mudan.me/op01
    // https://mudan.me/opera
    var matches = urlPath.match(RegExp("^/((op|og|rp|pt|ot)..|index-opera|opera|repost|poetry|share|print|kfc)$"))
    consoleDebug("Url matches = " + matches)
    if (matches != null && matches.length > 0) {
        // 检查是否符合格式，取出pid
        // https://mudan.me/id
        pid = matches[1]
    }
    if (pid == null) {
        // 不是短链跳转，如果处于404页，显示404提示（默认是不显示的）
        const e404 = document.getElementById("card_404_content")
        if (e404 != null) {
            e404.style.display = "block"
        }
        return
    }
    // 查询url映射表中的pid
    showShortLinkJumpDialog(pid)
}
