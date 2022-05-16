// 处理页面跳转，短链接

// 监听当前文章页的标题，点击3次，触发短链服务

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
 * 进入页面，检查是否携带了跳转参数 http://hostname?pid=id
 */
function checkJump() {
    const urlParams = new URLSearchParams(window.location.search)
    const pid = urlParams.get("pid")
    if (pid == null) return
    console.log("jump pid = " + pid)
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
        // progressbar.close()
        const mapJson = JSON.parse(response)
        for (let item of mapJson.map) {
            console.log(item.id)
            if (item.id == pid) {
                console.log("find pid " + pid + " => " + item.target.path)
                // 跳转到目标页，不在浏览器中保留跳转记录
                window.location.replace(host + item.target.path)
                break
            }
        }
        console.log("pid not exist, will create new")
    }).catch(error => {
        console.error(error)
        // progressbar.close()
    })
}