import type { ISearchPaginator } from "./interface/ISearchPaginator"
import { consoleDebug, consoleObjDebug } from "../../../util/log"
import { isDebug, sleepUntilMinimalTime } from "../../../util/tools"
import type { PagefindResult } from "../../../repository/bean/pagefind/ApiPagefindSearch"
import { PagefindFactory } from "../../../repository/Pagefind"
import type { ApiPagefindFilter } from "../../../repository/bean/pagefind/ApiPagefindFilter"

// pagefind 的筛选器，可筛选 category 和 tag。
// any 表示满足任一条件即可，否则满足所有条件才行
// 排序可选 asc 或 desc，默认以相关度排序
export type BasePagefindPaginatorOptions = {
    filters?: {
        category?: {
            any: string[]
        },
        tag?: string[],
    },
    sort?: {
        "precise-date": string
    }
}

export abstract class BasePagefindPaginator<P, T> implements ISearchPaginator<P, T> {
    PAGE_SIZE: number
    pagefind?: any
    pagefindResult?: PagefindResult
    cachedData: T[] = []
    cachedKey: string = ""
    cachedOptions?: BasePagefindPaginatorOptions
    abortController?: AbortController

    constructor(pageSize: number = 10) {
        this.PAGE_SIZE = pageSize
    }

    async search(newKey: string | null, options: BasePagefindPaginatorOptions, delay?: boolean): Promise<T[]> {
        consoleDebug("Search by pagefind paginator key => " + newKey)
        consoleObjDebug("Search options => ", options)
        if (this.abortController != null) {
            this.abortController.abort()
        }
        this.cachedKey = ""
        this.cachedOptions = undefined
        this.abortController = new AbortController()
        if (newKey?.length == 0) {
            this.pagefindResult = undefined
            this.cachedData = []
            return this.cachedData
        }
        const startTime = Date.now()
        await this.checkPagefindReady()
        const filters: ApiPagefindFilter = await this.pagefind.filters();
        consoleObjDebug("Get pagefind filters", filters)
        let pagefindResult: PagefindResult = await this.pagefind.search(newKey, options)
        const resultSize = pagefindResult?.results.length ?? 0

        consoleObjDebug("Pagefind results", pagefindResult)
        const firstPageSize = Math.min(resultSize, this.PAGE_SIZE)
        if (firstPageSize == 0) {
            this.pagefindResult = undefined
            this.cachedData = []
            return this.cachedData
        }
        const apiResults = await Promise.all(pagefindResult.results.slice(0, firstPageSize)
            .map(async it => await it.data()))
        consoleObjDebug("First page data", apiResults)
        const results = apiResults.map(it => this.convertToShowData(it as P))
        this.pagefindResult = pagefindResult
        this.cachedData = []
        this.cachedData.push(...results)
        if (delay) {
            await sleepUntilMinimalTime(startTime, this.abortController?.signal)
        }
        return this.cachedData
    }

    async loadMore(delay?: boolean): Promise<T[]> {
        consoleDebug("Load more by pagefind paginator")
        if (this.pagefindResult == null) {
            return this.search(this.cachedKey, this.cachedOptions ?? {}, delay)
        }
        if (this.abortController != null) {
            this.abortController.abort()
            consoleDebug("Abort previous pagefind load")
        }
        this.abortController = new AbortController()
        const startTime = Date.now()
        const remainingCount = this.pagefindResult.results.length - this.cachedData.length
        if (remainingCount <= 0) {
            return new Promise((resolve) => {
                resolve(this.cachedData.slice())
            })
        }
        const loadCount = Math.min(remainingCount, this.PAGE_SIZE)
        const startIndex = this.cachedData.length
        const apiResults = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount)
            .map(async it => await it.data()))
        consoleObjDebug("Load more page data", apiResults)
        const results = apiResults.map(it => this.convertToShowData(it as P))
        this.cachedData.push(...results)
        if (delay) {
            await sleepUntilMinimalTime(startTime, this.abortController?.signal)
        }
        return this.cachedData.slice()
    }

    async checkPagefindReady() {
        if (this.pagefind != null) return
        this.pagefind = await new PagefindFactory().getPagefind()
    }

    totalPostsSize(): number {
        if (this.pagefindResult == null) {
            return 0
        }
        return this.pagefindResult.results.length
    }

    hasMore(): boolean {
        let hasMore = false
        if (this.cachedData.length < this.totalPostsSize()) {
            hasMore = true
        }
        consoleDebug("Pagefind paginator has more ? " + hasMore)
        return hasMore
    }

    abort(): void {
        consoleDebug("Abort pagefind paginator request")
        if (this.abortController != null) {
            this.abortController.abort()
        }
    }

    abstract convertToShowData(data: P): T
}