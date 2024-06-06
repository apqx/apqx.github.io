import { ResultItemData, SearchDialog } from "./SearchDialog"
import { consoleDebug, consoleError, consoleObjDebug } from "../../util/log"
import { isDebug, runAfterMinimalTime } from "../../util/tools"
import { Item, Result } from "./bean/search/PagefindResult"
import { getPostDate, getPostType } from "../../base/post"
import { ERROR_HINT, getLoadHint } from "../react/LoadingHint"

const PAGE_SIZE: number = 10

export class SearchDialogPresenter {
    component: SearchDialog = null
    pagefind: any = null
    pagefindResult: Result = null
    key: string = null
    abortController: AbortController = null

    constructor(component: SearchDialog) {
        this.component = component
    }

    /**
     * 搜索
     * @param _key 搜索关键字
     */
    search(_key: string) {
        if (_key == null || _key == "") {
            this.clearResult()
            return
        }
        if (this.key == _key && this.component.state.loading) return
        this.key = _key
        if (this.abortController != null) this.abortController.abort()
        this.abortController = new AbortController()
        this.searchByPagefind(_key, this.abortController.signal)
    }

    private async searchByPagefind(key: string, signal: AbortSignal) {
        const startTime = Date.now()
        this.component.setState({
            loading: true,
        })
        try {
            if (this.pagefind == null) {
                await this.initPagefind()
                if (signal.aborted) {
                    consoleDebug("SearchByPagefind aborted")
                    return
                }
            }
            this.pagefindResult = await this.pagefind.search(key)
            if (signal.aborted) {
                consoleDebug("SearchByPagefind aborted")
                return
            }
            const resultSize = this.pagefindResult.results.length
            consoleObjDebug("Pagefind result => ", this.pagefindResult)
            const firstPageSize = Math.min(resultSize, PAGE_SIZE)
            if (firstPageSize == 0) {
                runAfterMinimalTime(startTime, () => {
                    if (signal.aborted) {
                        consoleDebug("SearchByPagefind aborted")
                        return
                    }
                    this.clearResult()
                })
                return
            }
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(0, firstPageSize).map(it => it.data()))
            if (signal.aborted) {
                consoleDebug("SearchByPagefind aborted")
                return
            }
            this.showSearchResult(itemList, true, startTime)
        } catch (e) {
            consoleError(e)
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

    async initPagefind() {
        let pagefindUrl: string = isDebug() ? "/npm/pagefind/pagefind.js" : "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/pagefind/pagefind.js"
        // webpack会对所有import进行打包、拆分，对于src中不存在而在网站中存在的js，打包时会因为找不到而异常
        // 添加注释可以避免webpack对这里的import打包，而在运行时引入
        this.pagefind = await import(/*webpackIgnore: true*/ pagefindUrl)
        // await pagefind.options({
        //     bundlePath: "/npm/dist/pagefind/"
        // })
        this.pagefind.init()
    }

    /**
     * 加载更多
    */
    loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT) {
            this.search(this.key)
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
            const remainingCount = this.pagefindResult.results.length - this.component.state.results.length
            const loadCount = remainingCount < PAGE_SIZE ? remainingCount : PAGE_SIZE
            const startIndex = this.component.state.results.length
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount).map(it => it.data()))
            if (signal.aborted) {
                consoleDebug("LoadMoreByPagefind aborted")
                return
            }
            this.showSearchResult(itemList, false, startTime)
        } catch (e) {
            consoleError(e)
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

    reduceResult() {
        const resultSize = this.getTotalResultSize()
        const loadSize = this.component.state.results.length
        if (loadSize > PAGE_SIZE) {
            const array = this.component.state.results.slice(0, PAGE_SIZE)
            this.component.setState({
                results: array,
                loadHint: getLoadHint(PAGE_SIZE, resultSize)
            })
        }
    }

    private getTotalResultSize(): number {
        return this.pagefindResult == null || this.pagefindResult.results == null ? 0 : this.pagefindResult.results.length
    }

    showSearchResult(itemList: Array<Item>, clear: boolean, startTime: number) {
        const resultSize = this.pagefindResult.results.length
        let results: ResultItemData[] = itemList.map(it =>
            new ResultItemData(it.meta.title, it.excerpt, getPostDate(it.raw_url), it.raw_url, getPostType(it.raw_url).name)
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
        let loadHint = getLoadHint(results.length, resultSize)
        consoleObjDebug("showSearchResult => ", results)
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
     * 跳转到Google，指定网站搜索
     */
    searchJumpGoogle(input: string) {
        if (input !== "") {
            // window.open("https://www.google.com/search?q=" + input + "+site:mudan.me", "_blank")
            window.open("https://cn.bing.com/search?go=Search&q=site:mudan.me+" + input, "_blank")
        }
    }
}