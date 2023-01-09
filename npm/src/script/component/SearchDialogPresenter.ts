import { ResultItemData, SearchDialogContent } from "./SearchDialog";
import { console_error } from "../util/LogUtil";

export class SearchDialogPresenter {
    component: SearchDialogContent = null
    // Google programmable search engine id
    searchEngineId: string = ""
    // Google cloud platform project key
    gcpKey: string = ""

    constructor(component: SearchDialogContent) {
        this.component = component
    }

    /**
     * 搜索
     * @param key 搜索关键字
     * @param startIndex 每页10个，本次请求的起始索引，从1开始
     */
    search(key: string, startIndex: number) {
        if (key == null || key == "") return
        const request = new Request("https://customsearch.googleapis.com/customsearch/v1?" +
            "cx=" + this.searchEngineId +
            "&exactTerms=" + key +
            "&key=" + this.gcpKey +
            "&start=" + startIndex, { method: "GET" }
        )
        this.component.setState({
            showLoading: true
        })
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((response: SearchResponse) => {
                this.showSearchResult(response)
            }).catch(error => {
                console_error(error)
                this.removeSearchResult()
            }
            )
    }

    /**
     * @param response
     */
    showSearchResult(response: SearchResponse) {
        if (response.searchInformation.totalResults === "0") {
            this.removeSearchResult()
            return
        }
        // 搜索结果索引，每页10个
        const totalPage = Math.ceil(Number(response.searchInformation.totalResults) / 10)
        const currentPage = Math.ceil(response.queries.request[0].startIndex / 10)
        const list = response.items.map((item) => {
            return new ResultItemData(item.htmlTitle, item.htmlSnippet, item.link)
        })
        const previousPageStartIndex = (response.queries.previousPage != null && response.queries.previousPage.length !== 0)
            ? response.queries.previousPage[0].startIndex : -1
        const nextPageStartIndex = (response.queries.nextPage != null && response.queries.nextPage.length !== 0)
            ? response.queries.nextPage[0].startIndex : -1
        this.component.setState({
            showLoading: false,
            resultList: list,
            totalPage: totalPage,
            currentPage: currentPage,
            previousPageStartIndex: previousPageStartIndex,
            nextPageStartIndex: nextPageStartIndex,
            searchText: response.queries.request[0].exactTerms
        })
    }

    removeSearchResult() {
        this.component.setState({
            showLoading: false,
            resultList: [],
            totalPage: -1,
            currentPage: -1,
            previousPageStartIndex: -1,
            nextPageStartIndex: -1,
            searchText: ""
        })
    }

    /**
     * 跳转到Google，指定网站搜索
     */
    searchJumpGoogle(input: string) {
        if (input !== "") {
            window.open("https://www.google.com/search?q=" + input + "+site:mudan.me", "_blank")
        }
    }
}

interface SearchResponse {
    queries: {
        previousPage: SearchResponseQueryItem[],
        request: SearchResponseQueryItem[],
        nextPage: SearchResponseQueryItem[],
    }
    searchInformation: {
        searchTime: number,
        formattedSearchTime: string,
        totalResults: string,
        formattedTotalResults: string
    }
    items: SearchResponseItem[]
}

interface SearchResponseQueryItem {
    totalResults: string
    count: number
    startIndex: number
    exactTerms: string
}

interface SearchResponseItem {
    title: string,
    htmlTitle: string,
    link: string,
    displayLink: string,
    htmlSnippet: string,
}


