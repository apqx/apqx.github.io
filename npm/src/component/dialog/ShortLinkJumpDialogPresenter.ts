import { ShortLinkDialog } from "./ShortLinkJumpDialog"
import { consoleDebug, consoleError } from "../../util/log"
import { runAfterMinimalTime } from "../../util/tools"
import type { ApiUrlMap } from "../../repository/bean/service/ApiUrlMap"
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO } from "../../repository/Service"

export class ShortLinkJumpDialogPresenter {
    component: ShortLinkDialog

    constructor(component: ShortLinkDialog) {
        this.component = component
    }

    /**
     * 从 url 映射文件中查询 pid
     */
    findPage(pid: string) {
        let startTimeMs = Date.now()
        getServiceInstance().getUrlMap({ debugMode: SERVICE_DEBUG_MODE_AUTO })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((response: ApiUrlMap) => {
                for (const item of response.map) {
                    if (item.id === pid) {
                        consoleDebug("Find pid " + pid + " => " + item.target.path)
                        // 跳转到目标页，不在浏览器中保留跳转记录，url 可以是站内的相对 path，也可以是站外 http 的绝对 path
                        var jumpUrl = item.target.path
                        if (!item.target.path.startsWith("http")) {
                            jumpUrl = window.location.origin + item.target.path
                        }
                        consoleDebug("JumpUrl is " + jumpUrl)
                        this.showJump(startTimeMs, jumpUrl, item.target.title)
                        return
                    }
                }
                this.showJump(startTimeMs, window.location.origin + "/404.html", "未找到目标页面")
                consoleDebug("Pid not exist, check url-map")
            }).catch(error => {
                consoleError(error)
                this.showJump(startTimeMs, window.location.origin + "/404.html", "解析映射表异常")
            }
            )
    }

    showJump(startTimeMs: number, url: string, linkTitle: string) {
        // “查询映射表”应至少显示 1s，“正在跳转”应至少显示 1s
        let timeGapQueryingMs = 800
        runAfterMinimalTime(startTimeMs, () => {
            this.refreshHint(linkTitle, url)
        }, timeGapQueryingMs)
    }

    private refreshHint(linkTitle: string, url: string) {
        this.component.setState({
            title: "正在跳转",
            content: linkTitle,
            onClickLink: () => {
                // 监听点击，手动实现跳转，且不记入浏览器的跳转记录
                window.location.replace(url)
            }
        })
        setTimeout(() => {
            // 延时 1s 再跳转，显示动画
            window.location.replace(url)
        }, 800)
    }
}
