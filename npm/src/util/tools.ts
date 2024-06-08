import { consoleDebug, consoleObjDebug } from "./log"

/**
 * 当HTML元素加载完成后执行指定的任务
 */
export function runOnHtmlDone(task: () => void) {
    // 监听HTML元素加载完成的DOMContentLoaded事件，但是有时候该事件会在设置监听器之前完成，所以这里检查一下是否已经完成了
    if (document.readyState !== "loading") {
        task()
    } else {
        // HTML元素加载完成，但是CSS等资源还未加载
        document.addEventListener("DOMContentLoaded", () => {
            task()
        })
    }
}

/**
 * 当整个页面及资源加载完成后执行指定的任务
 */
export function runOnPageDone(task: () => void) {
    // 有时候页面在设置监听器之前已经加载完成
    if (document.readyState == "complete") {
        task()
    } else {
        // 整个页面及资源都以加载完成
        window.addEventListener("load", () => {
            task()
        })
    }
}

/**
 * 当页面从缓存中加载时执行特定的任务，比如从某页面按back键返回到当前页
 */
export function runOnPageBackFromCache(task: () => void) {
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            // alert("The page was just restored from the Page Cache (eg. From the Back button.");
            consoleDebug("Page back from cache")
            task()
        }
    });
}

/**
 * 为React生成可以加载的HTMl类型的数据
 */
export function createHtmlContent(html: string) {
    return {__html: html}
}

export function toggleClassWithEnable(e: Element, className: string, enable: boolean) {
    if (enable && !e.classList.contains(className)) {
        e.classList.add(className)
    } else if (!enable && e.classList.contains(className)) {
        e.classList.remove(className)
    }
}

export function isMobileOrTablet(): boolean {
    let check = false
    let agent = navigator.userAgent || navigator.vendor
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4)))
        check = true
    consoleDebug("IsMobileOrTablet = " + check)
    return check
}

var debugMode:boolean = undefined

export function isDebug(): boolean {
    if(debugMode != undefined) return debugMode
    // 读取head里的debug标志
    const debugStr: string = document.querySelector("meta[name=debug]").getAttribute("content")
    debugMode = JSON.parse(debugStr)
    return debugMode
}

export function getHostWithHttp(): string {
    if (isDebug()) {
        return "http://localhost:4000"
    } else {
        return "https://mudan.me"
    }
}

export function getElementSize(e: HTMLElement, property: string): number {
    // 获得的值可能是auto或非数字
    // computedStyleMap目前不支持Firefox
    // const value = e.computedStyleMap().get(property)?.toString()
    const value = window.getComputedStyle(e).getPropertyValue(property)
    consoleDebug("GetElementSize " + property + " = " + value)
    const result = parseFloat(value.slice(0, -2))
    consoleDebug("GetElementSize result " + " = " + result)
    return Number.isNaN(result) ? 0 : result
}

export function getElementAttribute(e: HTMLElement, property: string) {
    return e.getAttribute(property)
}

export const MINIMAL_LOADING_TIME_MS = 200
export const MINIMAL_LOADING_TIME_MS_SHORT = 100
export function runAfterMinimalTime(startTime: number, func: () => void, _minimalTimeMs: number = -1) {
    const minimalTimeMs = _minimalTimeMs == -1 ? MINIMAL_LOADING_TIME_MS : _minimalTimeMs
    const usedTime = Date.now() - startTime
    if (usedTime < minimalTimeMs) {
        setTimeout(func, minimalTimeMs - usedTime)
    } else {
        func()
    }
}

export const clearFocusListener: (e: Event) => void = (e) => {
    const target = e.target as HTMLElement
    target.blur()
}