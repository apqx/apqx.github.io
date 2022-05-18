// 处理页面跳转，短链接
import { MDCDialog } from '@material/dialog'
import { MDCLinearProgress } from '@material/linear-progress'

// 监听当前文章页的标题，点击3次，触发短链服务

var dialog = null
var progressbar = null
var pTitle = null
var aTargetLink = null

// 监听HTML元素加载完成的DOMContentLoaded事件，但是有时候该事件会在设置监听器之前完成，所以这里检查一下是否已经完成了
if (document.readyState !== 'loading') {
    console.log("DOMContentLoaded ready before addListener, just init")
    runOnStart()
} else {
    console.log("DOMContentLoaded not ready before addListener, so add listener")
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener('DOMContentLoaded', (event) => {
        console.log("DOMContentLoaded listener get called, so start init")
        runOnStart()
    })
}

function runOnStart() {
    checkJump()
}

/**
 * 进入页面，检查是否携带了跳转参数 
 * https://apqx.me?pid=id
 * https://apqx.me/id
 */
function checkJump() {
    var pid = null
    const urlPath = window.location.pathname
    const matches = urlPath.match(/(op|og|rp|pt)..$/)
    if (matches != null && matches.length > 0) {
        // 检查是否符合格式1
        // https://apqx.me/id
        pid = matches[0]
        console.log("404 page pid = " + pid + " : " + matches)
    } else {
        // 检查是否符合格式2
        // https://apqx.me?pid=id
        const urlParams = new URLSearchParams(window.location.search)
        pid = urlParams.get("pid")
        console.log("common page pid = " + pid)
    }
    if (pid == null) {
        // 不是跳转，且处于404页，显示404提示（默认是不显示的）
        var e404 =  document.getElementById("card_404_content")
        if (e404 != null) {
            e404.style.display = "block"
        }
        return
    }
    progressbar = new MDCLinearProgress(document.getElementById("url_jumping_progressbar"))
    pTitle = document.getElementById("url_jumping_title")
    aTargetLink = document.getElementById("url_jumping_link")
    dialog = new MDCDialog(document.getElementById("url_jumping_dialog"))
    dialog.listen('MDCDialog:opened', () => {
        console.log("link jumping dialog opened")
        // Dialog弹出时似乎link获取了焦点，应该取消
        aTargetLink.blur()
    })

    pTitle.innerText = "正在查询"
    progressbar.determinate = false
    // 禁止点击空白处dismiss，涉及到MDCDialogFoundation，暂时不做
    // dialog.setScrimClickAction("")
    dialog.open()
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
    var host = window.location.host
    host = window.location.protocol + "//" + host
    const url = host + "/assets/url-map.json"
    const request = new Request(url, {
        method: 'GET'
    })
    // 请求是异步的
    fetch(request)
    .then(response => {
        if (response.status === 200) {
            return response.text()
        } else {
            throw new Error('Something went wrong on api server!')
        }
    })
    .then(response => {
        console.debug(response)
        const mapJson = JSON.parse(response)
        for (let item of mapJson.map) {
            console.log(item.id)
            if (item.id == pid) {
                console.log("find pid " + pid + " => " + item.target.path)
                // 跳转到目标页，不在浏览器中保留跳转记录
                jumpToUrl(host + item.target.path, item.target.title)
                return
            }
        }
        jumpToUrl(host + "/404.html", "未找到目标页面")
        console.log("pid not exist, will create new")
    }).catch(error => {
        console.error(error)
        jumpToUrl(host + "/404.html", "未找到映射表")
    })
}

function jumpToUrl(url, linkTitle) {
    pTitle.innerText = "正在跳转"
    aTargetLink.innerText = linkTitle
    aTargetLink.href = url
    // 监听点击，手动实现跳转，且不记入浏览器的跳转记录
    aTargetLink.addEventListener("click", () => {
        window.location.replace(url)
    })
    setTimeout(() => {
        // 延时2秒再跳转，显示动画
        window.location.replace(url)
    }, 2000)
}