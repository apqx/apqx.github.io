import type { ISearchPaginator } from "./interface/ISearchPaginator"
import { consoleInfo, consoleInfoObj } from "../../../util/log"
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
    /**
     * 每页加载的数量
     */
    PAGE_SIZE: number
    pagefind?: any
    pagefindResult?: PagefindResult
    cachedData: T[] = []
    cachedKey: string = ""
    cachedOptions?: BasePagefindPaginatorOptions

    constructor(pageSize: number = 10) {
        this.PAGE_SIZE = pageSize
    }

    async search(newKey: string | null, options: BasePagefindPaginatorOptions, delay?: boolean, abortSignal?: AbortSignal): Promise<T[]> {
        consoleInfo("Search by pagefind paginator key => " + newKey)
        consoleInfoObj("Search options => ", options)
        abortSignal?.throwIfAborted()
        this.cachedKey = ""
        this.cachedOptions = undefined
        if (newKey?.length == 0) {
            this.pagefindResult = undefined
            this.cachedData = []
            return this.cachedData
        }
        const startTime = Date.now()
        await this.checkPagefindReady()
        const filters: ApiPagefindFilter = await this.pagefind.filters();
        consoleInfoObj("Get pagefind filters", filters)
        let pagefindResult: PagefindResult = await this.pagefind.search(newKey, options)
        abortSignal?.throwIfAborted()

        const resultSize = pagefindResult?.results.length ?? 0
        consoleInfoObj("Pagefind results", pagefindResult)
        const firstPageSize = Math.min(resultSize, this.PAGE_SIZE)
        if (firstPageSize == 0) {
            this.pagefindResult = undefined
            this.cachedData = []
            return this.cachedData
        }
        const apiResults = await Promise.all(pagefindResult.results.slice(0, firstPageSize)
            .map(async it => await it.data()))
        consoleInfoObj("First page data", apiResults)
        const results = apiResults.map(it => this.convertToShowData(it as P))
        if (delay) {
            await sleepUntilMinimalTime(startTime, abortSignal)
        }
        abortSignal?.throwIfAborted()
        this.pagefindResult = pagefindResult
        this.cachedData = []
        this.cachedData.push(...results)
        return this.cachedData
    }

    async loadMore(delay?: boolean, abortSignal?: AbortSignal): Promise<T[]> {
        consoleInfo("Load more by pagefind paginator")
        if (this.pagefindResult == null) {
            return this.search(this.cachedKey, this.cachedOptions ?? {}, delay, abortSignal)
        }
        abortSignal?.throwIfAborted()
        const startTime = Date.now()
        const remainingCount = this.pagefindResult.results.length - this.cachedData.length
        if (remainingCount <= 0) {
            return this.cachedData.slice()
        }
        const loadCount = Math.min(remainingCount, this.PAGE_SIZE)
        const startIndex = this.cachedData.length
        const apiResults = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount)
            .map(async it => await it.data()))
        consoleInfoObj("Load more page data", apiResults)
        if (delay) {
            await sleepUntilMinimalTime(startTime, abortSignal)
        }
        abortSignal?.throwIfAborted()
        const results = apiResults.map(it => this.convertToShowData(it as P))
        this.cachedData.push(...results)
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
        consoleInfo("Pagefind paginator has more ? " + hasMore)
        return hasMore
    }

    abstract convertToShowData(data: P): T
}