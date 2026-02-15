import { start } from "repl";
import type { ApiPaginatePage } from "../../../repository/bean/service/ApiPaginatePage";
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO, SERVICE_DEBUG_MODE_OFF } from "../../../repository/Service";
import { consoleDebug, consoleObjDebug } from "../../../util/log";
import { MINIMAL_LOADING_TIME_MS, runAfterMinimalTime, sleep } from "../../../util/tools";
import type { IHttpPaginator } from "./interface/IHttpPaginator";

/**
 * Http 分页加载选项，以 tag 或 category 分页加载数据，按非空顺序选择
 */
export interface BaseHttpPaginatorOptions {
    tag: string,
    category: string
}

/**
 * H, 从接口获取的原始数据类型；T，转换后供组件显示的数据类型
 */
export abstract class BaseHttpPaginator<H, T> implements IHttpPaginator<H, T> {
    options: BaseHttpPaginatorOptions
    cachedPage: ApiPaginatePage<H>[] = []
    cachedData: T[] = []
    abortController?: AbortController

    constructor(options: BaseHttpPaginatorOptions) {
        this.options = options
    }

    async load(delay?: boolean): Promise<T[]> {
        consoleDebug(`Load by http paginator, tag = ${this.options.tag}, category = ${this.options.category}`)
        // 是否处于加载状态由上层判断，这里直接中断旧请求，发起新请求
        if (this.abortController != null) {
            this.abortController.abort()
            consoleDebug("Abort previous http paginate request")
        }
        this.abortController = new AbortController()
        const startTime = Date.now()
        return this.getRequest(this.abortController.signal, 1)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            }).then(async (page: ApiPaginatePage<H>) => {
                consoleObjDebug("Http paginator first page", page)
                this.cachedPage = []
                this.cachedPage.push(page)
                this.cachedData = []
                this.cachedData.push(...page.posts.map(item => this.convertToShowData(item)))
                const usedTime = Date.now() - startTime
                if (delay == true && usedTime < MINIMAL_LOADING_TIME_MS) {
                    await sleep(MINIMAL_LOADING_TIME_MS - usedTime)
                }
                return this.cachedData
            })
    }

    /**
    * 使用页码或直接 url 获取分页数据
    */
    getRequest(abortSignal: AbortSignal, page?: number, url?: string): Promise<Response> {
        let serviceConfig = { debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: abortSignal }
        // share 资源是由另一个工程输出到云端，本地没有，所以对它不能用调试链接
        if (this.options.category == "share") {
            serviceConfig = { debugMode: SERVICE_DEBUG_MODE_OFF, abortSignal: abortSignal }
        }
        // 使用给定的 url，如果没有则根据 tag 或 category 分页加载
        if (url == null || url.length == 0) {
            if (this.options.tag.length > 0) {
                return getServiceInstance().getPostsByTag(serviceConfig, this.options.tag, page ?? 1)
            } else {
                return getServiceInstance().getPostsByCategory(serviceConfig, this.options.category, page ?? 1)
            }
        } else {
            return getServiceInstance().getPostsByUrl(serviceConfig, url)
        }

    }

    async loadMore(delay?: boolean): Promise<T[]> {
        consoleDebug("Load more by http paginator")
        if (this.cachedPage.length == 0) {
            consoleDebug("Abort previous http paginate request")
            return this.load(delay)
        }
        if (this.abortController != null) {
            this.abortController.abort()
            consoleDebug("Abort previous http paginate request")
        }
        this.abortController = new AbortController()
        const nextPagePath = this.cachedPage[this.cachedPage.length - 1].data.nextPagePath
        if (nextPagePath == null || nextPagePath.length == 0) {
            return new Promise((resolve) => {
                resolve(this.cachedData.slice())
            })
        }
        const startTime = Date.now()
        return this.getRequest(this.abortController.signal, undefined, nextPagePath)
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                }
                throw new Error("Something went wrong on api server!")
            }).then(async (page: ApiPaginatePage<H>) => {
                consoleObjDebug("Http paginator more page", page)
                this.cachedPage.push(page)
                this.cachedData.push(...page.posts.map(item => this.convertToShowData(item)))
                const usedTime = Date.now() - startTime
                if (delay == true && usedTime < MINIMAL_LOADING_TIME_MS) {
                    await sleep(MINIMAL_LOADING_TIME_MS - usedTime)
                }
                return this.cachedData.slice()
            })
    }

    hasMore(): boolean {
        let hasMore = false
        // 首页加载完毕但下一页链接为空，没有更多
        const nextPagePath = this.cachedPage[this.cachedPage.length - 1].data.nextPagePath
        if (nextPagePath != null && nextPagePath.length > 0) {
            hasMore =  true
        }
        consoleDebug("Http paginator has more ? " + hasMore)
        return hasMore
    }

    totalPostsSize(): number {
        if (this.cachedPage.length == 0) {
            return 0
        }
        return this.cachedPage[0].data.totalPosts
    }

    abort(): void {
        consoleDebug("Abort http paginator request")
        if (this.abortController != null) {
            this.abortController.abort()
        }
    }

    abstract convertToShowData(data: H): T

}