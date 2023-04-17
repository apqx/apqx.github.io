// 处理页面跳转，短链接
import {showShortLinkJumpDialog} from "./component/ShortLinkJumpDialog";

/**
 * 进入页面，检查是否携带了跳转参数
 * https://mudan.me/pid
 */
export function checkJump() {
    let pid
    const urlPath = window.location.pathname
    const matches = urlPath.match(/(op|og|rp|pt|ot)..$/)
    if (matches != null && matches.length > 0) {
        // 检查是否符合格式，取出pid
        // https://mudan.me/id
        pid = matches[0]
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