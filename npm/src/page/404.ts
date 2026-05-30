import "./404.scss"
import { showShortLinkJumpDialog } from "../component/dialog/ShortLinkJumpDialog";
import { consoleInfo } from "../util/log";
import { runOnHtmlDone, runOnPageDone } from "../util/tools";
import { initContentCard } from "../component/contentCard";
import { mountLottieAnimation } from "../component/lottie";

export function init404() {
    runOnHtmlDone(() => {
        // 404 页面，卡片默认是隐藏的，由动画类之外的机制控制
        // 这里像其它页面一样正常处理动画类
        initContentCard(false)
    })

    runOnPageDone(() => {
        checkJump()
    })
}

/**
 * 进入页面，检查是否携带了跳转参数
 * https://mudan.me/pid
 */
function checkJump() {
    let pid = null
    const urlPath = window.location.pathname
    consoleInfo("Url path = " + urlPath)
    // https://mudan.me/op01
    // https://mudan.me/opera
    // og: original
    // rp: repost
    // op: opera
    // pt: poetry
    // ot: other
    var matches = urlPath.match(RegExp("^/((og|rp|op|pt|ot)\\d\\d|index-opera|opera|lens|repost|poetry|share|print|kfc)$"))
    consoleInfo("Url matches = " + matches)
    if (matches != null && matches.length > 0) {
        // 检查是否符合格式，取出pid
        // https://mudan.me/id
        pid = matches[1]
    }
    if (pid == null) {
        // 不是短链跳转，如果处于404页，显示404提示（默认是不显示的）
        show404()
        return
    }
    // 查询 url 映射表中的 pid
    showShortLinkJumpDialog(pid)
}

function show404() {
    const eCard = document.querySelector(".content-card")
    if (eCard) {
        (eCard as HTMLElement).style.display = "block"
    }
    initLottie()
}

function initLottie() {
    const wrapperE = document.querySelector(".lottie-animation-wrapper.emoji-404")
    if (wrapperE) {
        mountLottieAnimation(wrapperE as HTMLElement)
    }
}
