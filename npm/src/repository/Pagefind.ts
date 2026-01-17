import { consoleDebug, consoleObjDebug } from "../util/log"
import { isDebug } from "../util/tools"
import type { ApiPagefindSearch } from "./bean/pagefind/ApiPagefindSearch"
import type { PagefindResult, PagefindResultItem } from "./bean/pagefind/PagefindResult"
import type { ApiPost } from "./bean/service/ApiPost"
import { SERVICE_BASE_URL } from "./Service"

export class Pagefind {
    PAGE_SIZE: number
    key: string = ""
    pagefind: any | null = null
    pagefindResult: PagefindResult | null = null
    loadedCount: number = 0

    constructor(pageSize: number = 10) {
        this.PAGE_SIZE = pageSize
    }

    async search(newKey: string, options: any, abortSignal?: AbortSignal): Promise<ApiPagefindSearch> {
        consoleDebug("Pagefind search key => " + newKey)
        consoleObjDebug("Pagefind search options => ", options)

        if (newKey.length == 0) {
            this.pagefindResult = null
            this.loadedCount = 0
            return { total: 0, results: [] }
        }
        this.key = newKey
        await this.checkPagefindReady()
        if (abortSignal?.aborted) {
            throw new Error("Aborted")
        }
        const filters = await this.pagefind.filters();
        consoleObjDebug("Pagefind filters => ", filters)
        let pagefindResult: PagefindResult = await this.pagefind.search(newKey, options)
        if (abortSignal?.aborted) {
            throw new Error("Aborted")
        }
        const resultSize = pagefindResult?.results.length ?? 0
        consoleObjDebug("Pagefind result => ", pagefindResult)
        const firstPageSize = Math.min(resultSize, this.PAGE_SIZE)
        if (firstPageSize == 0) {
            this.pagefindResult = null
            this.loadedCount = 0
            return { total: 0, results: [] }
        }
        const itemList: Array<PagefindResultItem> = await Promise.all(pagefindResult.results.slice(0, firstPageSize).map(it => it.data()))
        if (abortSignal?.aborted) {
            throw new Error("Aborted")
        }
        const result = {
            "total": resultSize,
            "results": itemList
        }
        this.pagefindResult = pagefindResult
        this.loadedCount = result.results.length
        return result
    }

    async loadMore(abortSignal?: AbortSignal): Promise<ApiPagefindSearch> {
        if (this.pagefindResult == null) {
            throw new Error("Pagefind result is null")
        }
        const remainingCount = this.pagefindResult.results.length - this.loadedCount
        const loadCount = Math.min(remainingCount, this.PAGE_SIZE)
        const startIndex = this.loadedCount
        const itemList: Array<PagefindResultItem> = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount).map(it => it.data()))
        consoleObjDebug("Pagefind loadMore => ", itemList)
        if (abortSignal?.aborted) {
            throw new Error("Aborted")
        }
        const result = {
            "total": this.pagefindResult.results.length,
            "results": itemList
        }
        this.loadedCount += result.results.length
        return result
    }

    async checkPagefindReady() {
        if (this.pagefind == null) {
            let pagefindUrl: string = this.getBaseUrl() + "/pagefind/pagefind.js"
            // vite 会对所有 import 进行打包、拆分，对于 src 中不存在而在网站中存在的 js，打包时会因为找不到而异常
            // 添加此注释可以避免 vite 对这里的 import 打包，而是在运行时引入
            this.pagefind = await import(/*webpackIgnore: true*/ pagefindUrl)
            // await this.pagefind.options({
            //     bundlePath: "/npm/",
            // })
            this.pagefind.init()
        }
    }

    getBaseUrl(): string {
        if (isDebug()) {
            return window.location.origin + "/npm"
        } else {
            return SERVICE_BASE_URL
        }
    }
}