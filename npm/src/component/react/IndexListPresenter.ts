import { POST_TYPE_POETRY } from "../../base/constant";
import { PaginatePage } from "../../repository/service/bean/PaginatePage";
import { consoleError, consoleObjDebug } from "../../util/log";
import { isDebug, runAfterMinimalTime } from "../../util/tools";
import { IndexList, Post } from "./IndexList";
import { ERROR_HINT, getLoadHint } from "./LoadingHint";

export class IndexListPresenter {

    component: IndexList
    urlPrefix: string
    cachedPage: PaginatePage[] = null

    minimalLoadTime = 500

    constructor(component: IndexList) {
        this.component = component
    }

    init() {
        this.cachedPage = []
        const startTime = Date.now()
        this.component.setState({
            loading: true
        })
        if (isDebug()) {
            this.urlPrefix = window.location.origin
        } else {
            this.urlPrefix = "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog"
        }
        const request = new Request(this.urlPrefix + "/api/paginate/categories/" + this.component.props.category + "/page-1.json", {
            method: "GET"
        })

        fetch(request, { cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index first page", page)
                this.cachedPage.push(page)
                this.showPosts(page, false, startTime)
            }).catch(error => {
                consoleError(error)
                // runAfterMinimalTime(startTime, () => {
                this.component.setState({
                    loading: false,
                    loadHint: ERROR_HINT
                })
                // }, this.minimalLoadTime)
            }
            )
    }
    showPosts(page: PaginatePage, add: boolean, startTime: number) {
        const posts = new Array<Post>()
        if (add) {
            // 新页数据，直接加到已有数据末尾，保留已有数据
            posts.push(...this.component.state.posts)
        } else {
            // 首页数据，本地已有预加载数据，删除本地非pin置顶数据，即数据以云端为优先，更新本地
            // 只保留pin置顶数据
            posts.push(...this.component.state.posts.filter((post) => {
                return post.pin
            }))
        }
        for (const item of page.posts) {
            let author = item.author
            if (this.component.props.category == POST_TYPE_POETRY.identifier && item.moreDate.length > 0) {
                author = item.moreDate + " " + item.author
            }
            posts.push({
                title: item.title,
                author: author,
                date: item.date,
                path: item.path,
                pin: item.pin == "true",
                hide: item.hide == "true"
            })
        }
        const updateState = () => {
            this.component.setState({
                loading: false,
                loadHint: getLoadHint(posts.length, page.data.totalPosts),
                posts: posts
            })
        }
        updateState()
    }
    loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT && this.cachedPage.length == 0) {
            this.init()
            return
        }
        const nextPagePath = this.cachedPage[this.cachedPage.length - 1].data.nextPagePath
        if (nextPagePath.length == 0) {
            this.component.setState({
                loading: false,
                loadHint: null
            })
            return
        }
        const startTime = Date.now()
        this.component.setState({
            loading: true
        })
        const request = new Request(this.urlPrefix + nextPagePath, {
            method: "GET"
        })

        fetch(request, { cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index load page", page)
                this.cachedPage.push(page)
                this.showPosts(page, true, startTime)
            }).catch(error => {
                consoleError(error)
                this.component.setState({
                    loading: false,
                    loadHint: ERROR_HINT
                })
            }
            )
    }
}