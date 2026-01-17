import { ResultItemData, SearchDialog } from "./SearchDialog"
import { consoleDebug, consoleError, consoleObjDebug } from "../../util/log"
import { isDebug, runAfterMinimalTime } from "../../util/tools"
import type { PagefindResultItem, PagefindResult } from "../../repository/bean/pagefind/PagefindResult"
import { getPostDateByUrl } from "../../base/post"
import { ERROR_HINT, getLoadHint } from "../react/LoadingHint"
import { getSectionTypeByPath } from "../../base/constant"
import { Pagefind } from "../../repository/Pagefind"
import type { ApiPagefindSearch } from "../../repository/bean/pagefind/ApiPagefindSearch"

export class SearchDialogPresenter {
    component: SearchDialog
    pagefind: Pagefind
    key: string | null = null
    abortController: AbortController | null = null

    constructor(component: SearchDialog) {
        this.component = component
        this.pagefind = new Pagefind()
    }

    /**
     * 搜索
     * @param newKey 搜索关键字
     */
    search(newKey: string) {
        if (newKey == null || newKey == "") {
            this.clearResult()
            return
        }
        if (this.key == newKey && this.component.state.loading) return
        this.key = newKey
        if (this.abortController != null) this.abortController.abort()
        this.abortController = new AbortController()
        this.searchByPagefind(newKey, this.abortController.signal)
    }

    private async searchByPagefind(key: string, signal: AbortSignal) {
        const startTime = Date.now()
        this.component.setState({
            loading: true,
        })
        try {
            const pagefindOptions = {
                filters: {
                    category: { any: ["original", "repost", "poetry", "opera"] }
                }
            }

            const result = await this.pagefind.search(key, pagefindOptions, signal)
            if (result.results.length == 0) {
                runAfterMinimalTime(startTime, () => {
                    if (signal.aborted) {
                        consoleDebug("SearchByPagefind aborted")
                        return
                    }
                    this.clearResult()
                })
                return
            }
            this.showSearchResult(result, true, startTime)
        } catch (e: unknown) {
            if (e instanceof Error)
                consoleError(e.message)
            runAfterMinimalTime(startTime, () => {
                if (signal.aborted) {
                    consoleDebug("SearchByPagefind aborted")
                    return
                }
                this.component.setState({
                    loading: false,
                    loadHint: ERROR_HINT
                })
            })
        }
    }

    loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT && this.component.state.results.length == 0) {
            this.search(this.key ?? "")
            return
        }
        if (this.abortController != null) this.abortController.abort()
        this.abortController = new AbortController()
        this.loadMoreByPagefind(this.abortController.signal)
    }

    private async loadMoreByPagefind(signal: AbortSignal) {
        const startTime = Date.now()
        this.component.setState({
            loading: true,
        })
        try {
            const result = await this.pagefind.loadMore(signal)
            if (signal.aborted) {
                consoleDebug("LoadMoreByPagefind aborted")
                return
            }
            this.showSearchResult(result, false, startTime)
        } catch (e: unknown) {
            if (e instanceof Error)
                consoleError(e.message)
            runAfterMinimalTime(startTime, () => {
                if (signal.aborted) {
                    consoleDebug("LoadMoreByPagefind aborted")
                    return
                }
                this.component.setState({
                    loading: false,
                    loadHint: ERROR_HINT
                })
            })
        }
    }

    showSearchResult(result: ApiPagefindSearch, clear: boolean, startTime: number) {
        consoleObjDebug("showSearchResult pagefind", result)
        let results: ResultItemData[] = result.results.map(it =>
            new ResultItemData(it.meta.title, it.excerpt, getPostDateByUrl(it.raw_url), it.raw_url, getSectionTypeByPath(it.raw_url).name)
        )
        if (!clear) {
            const tempResult = new Array<ResultItemData>()
            this.component.state.results.forEach(it => {
                tempResult.push(it)
            })
            results.forEach(it => {
                tempResult.push(it)
            })
            results = tempResult
        }
        let loadHint = getLoadHint(results.length, result.total)
        consoleObjDebug("showSearchResult converted =>", results)
        runAfterMinimalTime(startTime, () => {
            this.component.setState({
                loading: false,
                loadHint: loadHint,
                results: results,
            })
        })
    }

    clearResult() {
        this.component.setState({
            loading: false,
            loadHint: null,
            results: [],
        })
    }

    abortSearch() {
        if (this.abortController != null) this.abortController.abort()
        if (this.component.state.loading)
            this.component.setState({
                loading: false,
            })
    }

    /**
     * 跳转到 Google 站内搜索
     */
    searchJumpGoogle(input: string) {
        if (input !== "") {
            // window.open("https://www.google.com/search?q=" + input + "+site:mudan.me", "_blank")
            window.open("https://cn.bing.com/search?go=Search&q=site:mudan.me+" + input, "_blank")
        }
    }
}