import {ShortLinkDialogContent, showShortLinkJumpDialog} from "./ShortLinkJumpDialog";
import {console_debug, console_error} from "../util/LogUtil";


interface UrlMapJson {
    map: UrlMapItem[]
}

interface UrlMapItem {
    "id": string,
    "target": {
        "path": string,
        "title": string
    }
}

export class ShortLinkJumpDialogPresenter {
    component: ShortLinkDialogContent = null

    constructor(component: ShortLinkDialogContent) {
        this.component = component
    }

    /**
     * 从url映射文件中查询pid
     */
    findPage(pid: string) {
        const url = window.location.origin + "/archives/url-map.txt"
        const request = new Request(url, {
            method: "GET"
        })
        // 请求是异步的
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((response: UrlMapJson) => {
                for (const item of response.map) {
                    if (item.id === pid) {
                        console_debug("find pid " + pid + " => " + item.target.path)
                        // 跳转到目标页，不在浏览器中保留跳转记录，url可以是站内的相对path，也可以是站外http的绝对path
                        var jumpUrl = item.target.path
                        if(!item.target.path.startsWith("http")) {
                            jumpUrl = window.location.origin + item.target.path
                        }
                        console_debug("jumpUrl is " + jumpUrl)
                        this.showJump(jumpUrl, item.target.title)
                        return
                    }
                }
                this.showJump(window.location.origin + "/404.html", "未找到目标页面")
                console_debug("pid not exist, will create new")
            }).catch(error => {
                console_error(error)
                this.showJump(window.location.origin + "/404.html", "未找到映射表")
            }
        )
    }

    showJump(url: string, linkTitle: string) {
        this.component.setState({
                title: "正在跳转",
                content: linkTitle,
                onClickLink: () => {
                    // 监听点击，手动实现跳转，且不记入浏览器的跳转记录
                    window.location.replace(url)
                }
            }
        )

        setTimeout(() => {
            // 延时2秒再跳转，显示动画
            window.location.replace(url)
        }, 2500)
    }
}