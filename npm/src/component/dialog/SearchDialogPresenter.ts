import { ResultItemData, SearchDialog } from "./SearchDialog"
import { consoleDebug, consoleError, consoleObjDebug } from "../../util/log"
import { isDebug, runAfterMinimalTime } from "../../util/tools"
import { Item, Result } from "./bean/search/PagefindResult"
import { getPostDate, getPostType } from "../../base/post"
import { ERROR_HINT, getLoadHint } from "../react/LoadingHint"

const PAGE_SIZE: number = 10

export class SearchDialogPresenter {
    component: SearchDialog = null
    pagefindResult: Result = null
    key: string = null

    constructor(component: SearchDialog) {
        this.component = component
    }

    /**
     * 搜索
     * @param key 搜索关键字
     */
    async search(key: string) {
        if (key == null || key == "") {
            this.clearResult()
            return
        }
        if (this.component.state.loading) return
        this.key = key
        const startTime = Date.now()
        this.component.setState({
            loading: true,
            loadHint: null
        })
        try {
            let pagefindUrl: string = isDebug() ? "/npm/pagefind/pagefind.js" : "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/pagefind/pagefind.js"
            // webpack会对所有import进行打包、拆分，对于src中不存在而在网站中存在的js，打包时会因为找不到而异常
            // 添加注释可以避免webpack对这里的import打包，而在运行时引入
            const pagefind = await import(/*webpackIgnore: true*/ pagefindUrl)
            // await pagefind.options({
            //     bundlePath: "/npm/dist/pagefind/"
            // })
            pagefind.init()
            this.pagefindResult = await pagefind.search(key)
            const resultSize = this.pagefindResult.results.length
            consoleObjDebug("Pagefind result => ", this.pagefindResult)
            const firstPageSize = resultSize < PAGE_SIZE ? resultSize : PAGE_SIZE

            if (firstPageSize == 0) {
                runAfterMinimalTime(startTime, () => {
                    this.clearResult()
                })
                return
            }
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(0, firstPageSize).map(it => it.data()))
            this.showSearchResult(itemList, true, startTime)
        } catch (e) {
            consoleError(e)
            runAfterMinimalTime(startTime, () => {
                this.component.setState({
                    loading: false,
                    loadHint: ERROR_HINT
                })
            })
        }
    }

    /**
     * 加载更多
    */
    async loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT) {
            this.search(this.key)
            return
        }
        const startTime = Date.now()
        this.component.setState({
            loading: true,
            loadHint: null
        })
        try {
            const remainingCount = this.pagefindResult.results.length - this.component.state.results.length
            const loadCount = remainingCount < PAGE_SIZE ? remainingCount : PAGE_SIZE
            const startIndex = this.component.state.results.length
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount).map(it => it.data()))
            this.showSearchResult(itemList, false, startTime)
        } catch (e) {
            consoleError(e)
            runAfterMinimalTime(startTime, () => {
                this.component.setState({
                    loading: false,
                    loadHint: "加载错误，点击重试"
                })
            })
        }
    }

    reduceResult() {
        const resultSize = this.pagefindResult.results.length
        const loadSize = this.component.state.results.length
        if (loadSize > PAGE_SIZE) {
            const array = this.component.state.results.slice(0, PAGE_SIZE)
            this.component.setState({
                results: array,
                loadHint: getLoadHint(PAGE_SIZE, resultSize)
            })
        }
    }

    showSearchResult(itemList: Array<Item>, clear: boolean, startTime: number) {
        const resultSize = this.pagefindResult.results.length
        let results: ResultItemData[] = itemList.map(it =>
            new ResultItemData(it.meta.title, it.excerpt, getPostDate(it.raw_url), it.raw_url, getPostType(it.raw_url))
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