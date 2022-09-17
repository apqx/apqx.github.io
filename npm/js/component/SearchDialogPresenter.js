import {console_error} from "../util/logutil";

export class SearchDialogPresenter {
    /**
     * @param {SearchDialog} component
     */
    constructor(component) {
        this.component = component
    }

    /**
     * 搜索
     * @param {*} key 搜索关键字
     * @param {*} startIndex 每页10个，本次请求的起始索引，从1开始
     */
    search(key, startIndex) {
        if (key == null || key === "") return
        const request = new Request("https://customsearch.googleapis.com/customsearch/v1?cx=b74f06c1723da9656&exactTerms=" +
            key + "&key=AIzaSyDYDqedqxaV6Qfv2i8OWpcS0phD-G2WDcg&start=" + startIndex, {method: "GET"}
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
            .then(response => {
                this.showSearchResult(response)
            }).catch(error => {
                console_error(error)
                this.removeSearchResult()
            }
        )
    }

    showSearchResult(response) {
        if (response.searchInformation.totalResults === "0") {
            this.removeSearchResult()
            return
        }
        // 搜索结果索引，每页10个
        const totalPage = Math.ceil(response.searchInformation.totalResults / 10)
        const currentPage = Math.ceil(response.queries.request[0].startIndex / 10)
        const list = response.items.map((item) => {
            return {
                title: item.htmlTitle,
                description: item.htmlSnippet,
                url: item.link
            }
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
}


