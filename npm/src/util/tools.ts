import type { RefObject } from "react"
import type { Post } from "../component/base/paginate/bean/Post"
import { consoleError, consoleInfo, consoleInfoObj } from "./log"

/**
 * 当HTML元素加载完成后执行指定的任务
 */
export function runOnHtmlDone(task: () => void) {
    // 监听HTML元素加载完成的DOMContentLoaded事件，但是有时候该事件会在设置监听器之前完成，所以这里检查一下是否已经完成了
    if (document.readyState !== "loading") {
        consoleInfo("Document readyState: loading done")
        task()
    } else {
        // HTML元素加载完成，但是CSS等资源还未加载
        document.addEventListener("DOMContentLoaded", () => {
            consoleInfo("Document event: DOMContentLoaded")
            task()
        })
    }
}

/**
 * 当整个页面及资源加载完成后执行指定的任务，包括字体、图片等
 */
export function runOnPageDone(task: () => void) {
    // 有时候页面在设置监听器之前已经加载完成
    if (document.readyState == "complete") {
        consoleInfo("Document readState: complete")
        task()
    } else {
        // 整个页面及资源都以加载完成
        window.addEventListener("load", () => {
            consoleInfo("Window event: load")
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
            consoleInfo("Page back from cache")
            task()
        }
    });
}

/**
 * 为React生成可以加载的HTMl类型的数据
 */
export function createHtmlContent(html: string) {
    return { __html: html }
}

export function toggleElementClass(e: Element | null, className: string, enable: boolean) {
    if (e == null) {
        consoleInfo("Element is null")
        return
    }
    if (enable && !elementContainsClass(e, className)) {
        e.classList.add(className)
    } else if (!enable && elementContainsClass(e, className)) {
        e.classList.remove(className)
    }
}

export function elementContainsClass(e: Element | null, className: string): boolean {
    if (e == null) {
        consoleInfo("Element is null")
        return false
    }
    return e.classList.contains(className)
}

export function isChrome(): boolean {
    let check = false
    const agent = navigator.userAgent || navigator.vendor
    if (/Chrome/.test(agent)) {
        check = true
    }
    consoleInfo("IsChrome = " + check)
    return check
}

export function isSafari(): boolean {
    let check = false
    const agent = navigator.userAgent || navigator.vendor
    if (/Safari/.test(agent) && !/Chrome/.test(agent) && !/Android/.test(agent) && !/Firefox/.test(agent)) {
        check = true
    }
    consoleInfo("IsSafari = " + check)
    return check
}

// 扩展类型声明
declare global {
    interface Navigator {
        userAgentData?: {
            platform: string;
            mobile: boolean;
            brands: Array<{ brand: string; version: string }>;
        };
    }
}

export function isAndroidModern(): boolean {
    if (typeof navigator === 'undefined') return false;

    // 优先使用现代 API 判断
    if (navigator.userAgentData) {
        return navigator.userAgentData.platform?.toLowerCase() === 'android';
    }

    // 如果浏览器不支持 userAgentData，降级使用传统 UA 判断
    return /Android/i.test(navigator.userAgent);
}

interface NavigatorUADATA {
    brands: { brand: string; version: string }[];
    mobile: boolean;
    platform: string;
}

export async function getChromeVersion(): Promise<string | null> {
    // 通过 userAgentData 获取 Chrome 版本，使用现代 API 判断
    // 该 API 目前在 Chrome 86+ 中可用，且需要在安全上下文（HTTPS）中使用
    const uaData = (navigator as any).userAgentData as NavigatorUADATA | undefined
    consoleInfo("Navigator userAgentData: " + JSON.stringify(uaData))

    if (uaData?.brands) {
        // 找到品牌为 "Google Chrome" 或 "Chromium" 的项
        const chromium = uaData.brands.find(item => item.brand.toLowerCase() === 'chromium')
        if (chromium) {
            return chromium.version // 返回主版本号，如 "124"
        }
    }
    // 作为降级方案，使用传统 UA 字符串解析版本号
    return getChromeVersionFromUA()
}

export function getChromeVersionFromUA(): string | null {
    const ua = navigator.userAgent;

    // 针对 Android Chrome 的匹配逻辑
    // 格式通常包含: Chrome/124.0.0.0
    const match = ua.match(/Chrome\/([0-9]+)/);

    if (match?.[1]) {
        return match[1];
    }

    return null;
}

let debugMode: boolean | undefined
let writingMode: boolean | undefined

export function isDebug(): boolean {
    if (debugMode != undefined) return debugMode
    // 读取head里的debug标志
    const debugStr: string = document.querySelector("meta[name=debug]")!!.getAttribute("content")!!
    debugMode = JSON.parse(debugStr) as boolean
    return debugMode
}

export function isWriting(): boolean {
    if (writingMode != undefined) return writingMode
    // 读取head里的writing标志
    const writingStr: string = document.querySelector("meta[name=writing]")!!.getAttribute("content")!!
    writingMode = JSON.parse(writingStr) as boolean
    return writingMode
}

export function getHostWithHttp(): string {
    if (isDebug()) {
        return "http://localhost:4000"
    } else {
        return "https://mudan.me"
    }
}

export function getElementComputeSize(e: HTMLElement, property: string): number {
    // 获得的值可能是 auto 或非数字或 calc(100% - 32px) 这种
    // computedStyleMap 目前不支持 Firefox
    // const value = e.computedStyleMap().get(property)?.toString()
    const value = window.getComputedStyle(e).getPropertyValue(property)
    consoleInfo("GetElementSize " + property + " = " + value)
    const result = parseFloat(value.slice(0, -2))
    consoleInfo("GetElementSize result " + " = " + result)
    return Number.isNaN(result) ? 0 : result
}

export function getResolvedElementMaxHeight(element: HTMLElement): number | null {
    const computed = window.getComputedStyle(element);
    const rawMaxHeight = computed.maxHeight;

    // 1. 若属性本身未设置或失效，返回 null
    if (rawMaxHeight === "none") {
        return null;
    }

    // 2. 若值已是纯像素形式（例如设置了固定 px 单位）
    if (rawMaxHeight.endsWith("px")) {
        return parseFloat(rawMaxHeight);
    }

    // 3. 针对包含百分比的 calc 表达式：获取包含块的实际几何高度进行换算
    const parent = element.parentElement;
    if (!parent) {
        return null;
    }

    const parentHeight = parent.clientHeight - parseNumberStrict(parent.style.paddingTop) - parseNumberStrict(parent.style.paddingBottom);

    // 正则提取 calc(100% - 32px) 或 calc(100% + 10px) 中的像素偏移量
    // 匹配形式：calc(100% [+-] Xpx)
    const calcMatch = rawMaxHeight.match(/calc\(\s*100%\s*([+-])\s*([\d.]+)px\s*\)/);
    if (calcMatch) {
        const operator = calcMatch[1];
        const offsetPx = parseFloat(calcMatch[2]);
        const delta = operator === "-" ? -offsetPx : offsetPx;
        return Math.max(0, parentHeight + delta);
    }

    // 若仅声明为 calc(100%) 或 100%
    if (rawMaxHeight === "100%" || rawMaxHeight === "calc(100%)") {
        return parentHeight;
    }

    return null;
}

function parseNumberStrict(value: string): number {
    const trimmed = value.trim();
    // 排除空串与纯空格，因为 Number("") 在 JS 中会被隐式转换为 0
    if (trimmed === "") {
        return 0;
    }

    const num = Number(trimmed);
    // Number.isFinite 同时排除 NaN、+Infinity 和 -Infinity
    return Number.isFinite(num) ? num : 0;
}

export function getElementAttribute(e: HTMLElement, property: string) {
    return e.getAttribute(property)
}

/**
 * 判断目标对象是否为 RefObject 结构
 */
export function isRefObject<T = unknown>(value: unknown): value is RefObject<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "current" in value
    );
}

export function getMetaContent(metaName: string) {
    const metaE = document.querySelector(`meta[${metaName}]`)
    if (metaE != null) {
        return metaE.getAttribute("content")
    } else {
        return null
    }
}

export async function share(title: string, _description: string, url: string, onSuccess: () => void, onFailed: (error: string) => void) {
    // 不传递 text 属性，仅传递 title 和 url 可被微信识别为链接卡片，微信会自己从 url 抓取 title、description、image
    // 否则是一串 text + url 文本，不显示 title。
    const shareData = {
        title: title,
        // text: description,
        url: url
    }
    consoleInfoObj("Share by invoke native interface: ", shareData)
    if (navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            consoleInfo("Share success")
            onSuccess()
        } catch (error) {
            consoleError("Share error: " + error)
            if (error instanceof Error && error.name.toLowerCase().includes("abort")) {
                onFailed("分享中止")
            } else {
                onFailed("分享失败：" + error)
            }
        }
    } else {
        consoleError("Share failed, not support share or share data invalidate")
        onFailed("当前设备不支持分享或数据异常")
    }
}

export const MINIMAL_LOADING_TIME_MS = 300
export const MINIMAL_LOADING_TIME_MS_SHORT = 100
export function runAfterMinimalTime(startTime: number, func: () => void, minimalTimeMs?: number, abortSignal?: AbortSignal) {
    minimalTimeMs = minimalTimeMs ?? MINIMAL_LOADING_TIME_MS
    const usedTime = Date.now() - startTime
    if (usedTime < minimalTimeMs) {
        setTimeout(() => {
            if (abortSignal?.aborted) {
                consoleInfo("runAfterMinimalTime aborted")
                return
            }
            func()
        }, minimalTimeMs - usedTime)
    } else {
        func()
    }
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

/**
 * 确保自指定时间起至少经过最小加载时间后才继续执行，期间如果 abortSignal 被触发则抛出异常
 * @param startTime 其实时间，单位毫秒
 * @param abortSignal 中断信号
 */
export async function sleepUntilMinimalTime(startTime: number, abortSignal?: AbortSignal): Promise<void> {
    const usedTime = Date.now() - startTime
    if (usedTime < MINIMAL_LOADING_TIME_MS) {
        await sleep(MINIMAL_LOADING_TIME_MS - usedTime)
    }
    abortSignal?.throwIfAborted()
}

export const clearFocusListener: (e: Event) => void = (e) => {
    const target = e.target as HTMLElement
    target.blur()
}

export function parseImageSize(sizeStr: string | null): number[] | undefined {
    if (sizeStr == null || sizeStr.trim() == "") {
        return undefined
    }
    const sizeArray = sizeStr.split("x")
    if (sizeArray.length != 2) {
        return undefined
    }
    const width = parseInt(sizeArray[0], 10)
    const height = parseInt(sizeArray[1], 10)
    if (Number.isNaN(width) || Number.isNaN(height)) {
        return undefined
    }
    return [width, height]
}

/**
 * 将数组中指定数量的 pinned 改为 featured
 * @param pinnedListSize 要查找的 pinned 数量
 * @returns 修改后的原数组
 */
export function convertPinedToFeatured(pinnedListSize: number, posts: Array<Post>): Array<Post> {
    let findCount = 0
    for (const post of posts) {
        if (post.pinned) {
            findCount++
            post.pinned = false
            post.featured = true
            if (findCount >= pinnedListSize) {
                consoleInfo("Find pinned post " + post.title + " but already find enough pinned posts, stop converting")
                break
            }
        }
    }
    return posts
}