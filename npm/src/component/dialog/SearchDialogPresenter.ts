import { ResultItemData, SearchDialog } from "./SearchDialog"
import { consoleDebug, consoleError } from "../../util/log"
import { isDebug } from "../../util/tools"
import { Item, Result } from "./bean/search/PagefindResult"
import { getPostDate, getPostType } from "../../base/post"

const PAGE_SIZE: number = 10

export class SearchDialogPresenter {
    component: SearchDialog = null

    key: string = null
    pagefindResult: Result = null
    searching: boolean = false

    constructor(component: SearchDialog) {
        this.component = component
    }

    /**
     * 搜索
     * @param key 搜索关键字
     */
    async search(key: string) {
        if (key == null || key == "") return
        // 同一个key，正在执行｜已有结果，return
        if (this.key == key && (this.searching || this.pagefindResult != null)) return
        this.searching = true
        this.component.setState({
            showLoading: true,
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
            console.log(this.pagefindResult)
            const firstPageSize = resultSize < PAGE_SIZE ? resultSize : PAGE_SIZE
            // const item = await this.pagefindResult.results[0].data()
            // console.log(item)
            if (firstPageSize == 0) {
                this.showSearchResult([])
                return
            }
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(0, firstPageSize).map(it => it.data()))

            this.showSearchResult(itemList, true)
        } catch (e) {
            consoleError(e)
            this.component.setState({
                showLoading: false,
                loadHint: null
             })
        }
        this.searching = false
    }

    /**
     * 加载更多
    */
    async loadMore() {
        if (this.searching) return
        this.searching = true
        this.component.setState({
            showLoading: true,
            loadHint: null
        })
        try {
            const remainingCount = this.pagefindResult.results.length - this.component.state.results.length
            const loadCount = remainingCount < PAGE_SIZE ? remainingCount : PAGE_SIZE
            const startIndex = this.component.state.results.length
            const itemList: Array<Item> = await Promise.all(this.pagefindResult.results.slice(startIndex, startIndex + loadCount).map(it => it.data()))
            this.showSearchResult(itemList, false)
        } catch (e) {
            consoleError(e)
            this.component.setState({
                showLoading: false,
                loadHint: "加载错误，点击重试"
            })
        }
        this.searching = false
    }

    showSearchResult(itemList: Array<Item>, clear: boolean = false) {
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
        let loadHint: string = null
        console.log(results)
        if (results.length < resultSize) {
            loadHint = results.length + "/" + resultSize + " 加载更多"
        }
        this.component.setState({
            showLoading: false,
            loadHint: loadHint,
            results: results,
            resultSize: resultSize
        })
    }

    clearResult() {
        this.component.setState({
            showLoading: false,
            loadHint: null,
            results: [],
            resultSize: 0,
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