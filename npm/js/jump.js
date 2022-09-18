// 处理页面跳转，短链接
import {runOnHtmlDone} from "./util/tools";
import {showShortLinkJumpDialog} from "./component/ShortLinkJumpDialog";
import {console_debug, console_error} from "./util/logutil";

runOnHtmlDone(() => {
    checkJump()
})

/**
 * 进入页面，检查是否携带了跳转参数
 * https://apqx.me/pid
 */
function checkJump() {
    let pid
    const urlPath = window.location.pathname
    const matches = urlPath.match(/(op|og|rp|pt)..$/)
    if (matches != null && matches.length > 0) {
        // 检查是否符合格式，取出pid
        // https://apqx.me/id
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

    showShortLinkJumpDialog("正在查询", "")
    // 查询url映射表中的pid
    findPid(pid)
}

/*
// url映射文件位于 /assets/url-map.json
// id规则，opera: op，original: og，repost: rp，poetry: pt
{
    "map": [
        {
            "id": "op0",
            "target": {
                "path": "_site/post/opera/2021/06/27/昆曲-牡丹亭-拾画叫画-折子.html",
                "title": "昆曲「牡丹亭·拾画叫画」折子"
            }
        },
    ]
}
/*

/**
 * 从url映射文件中查询pid
 * @param {string} pid 
 */
function findPid(pid) {
    const url = window.location.origin + "/assets/url-map.json"
    const request = new Request(url, {
        method: "GET"
    })
    // 请求是异步的
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text()
            } else {
                throw new Error("Something went wrong on api server!")
            }
        })
        .then(response => {
            console_debug(response)
            const mapJson = JSON.parse(response)
            for (const item of mapJson.map) {
                console_debug(item.id)
                if (item.id === pid) {
                    console_debug("find pid " + pid + " => " + item.target.path)
                    // 跳转到目标页，不在浏览器中保留跳转记录
                    jumpToUrl(window.location.origin + item.target.path, item.target.title)
                    return
                }
            }
            jumpToUrl(window.location.origin + "/404.html", "未找到目标页面")
            console_debug("pid not exist, will create new")
        }).catch(error => {
        console_error(error)
        jumpToUrl(window.location.origin + "/404.html", "未找到映射表")
    })
}

function jumpToUrl(url, linkTitle) {
    showShortLinkJumpDialog("正在跳转", linkTitle, () => {
        // 监听点击，手动实现跳转，且不记入浏览器的跳转记录
        window.location.replace(url)
    })

    setTimeout(() => {
        // 延时2秒再跳转，显示动画
        window.location.replace(url)
    }, 2000)
}