import { SECTION_TYPE_POETRY } from "../../../base/constant";
import { PaginatePage } from "../../../repository/service/bean/PaginatePage";
import { consoleError, consoleObjDebug } from "../../../util/log";
import { isDebug, runAfterMinimalTime } from "../../../util/tools";
import { BasePostPaginateShow, BasePostPaginateShowProps, Post } from "./BasePostPaginateShow";
import { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter";
import { ERROR_HINT, getLoadHint } from "../LoadingHint";
import { ApiPost } from "../../../repository/service/bean/Post";

export class PostPaginateShowPresenter implements IPostPaginateShowPresenter {
    component: BasePostPaginateShow<BasePostPaginateShowProps>
    urlPrefix: string | null = null
    cachedPage: PaginatePage[] | null = null
    firstLoadingDelay: boolean = false
    abortController: AbortController | null = null

    constructor(component: BasePostPaginateShow<any>, firstLoadingDelay: boolean = false) {
        this.component = component
        this.firstLoadingDelay = firstLoadingDelay
    }

    destroy() {

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
        let url = ""
        // Jekyll生成的分页文件名会把Tag、Category中一些字符替换为`-`，这里要做相应的处理
        const regex = new RegExp("[·_]")
        if (this.component.props.tag.length > 0) {
            const tag = this.component.props.tag.replace(regex, "-").toLowerCase()
            url = this.urlPrefix + "/api/paginate/tags/" + tag + "/page-1.json"
        } else {
            const category = this.component.props.category.replace(regex, "-").toLowerCase()
            url = this.urlPrefix + "/api/paginate/categories/" + category + "/page-1.json"
        }

        const request = new Request(url, {
            method: "GET"
        })
        if (this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        fetch(request, { signal: this.abortController.signal, cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index api first page", page)
                this.cachedPage!!.push(page)
                this.showPosts(page, false, false, startTime)
            }).catch(error => {
                consoleError(error)
                runAfterMinimalTime(startTime, () => {
                    this.component.setState({
                        loading: false,
                        loadHint: ERROR_HINT
                    })
                })
            }
            )
    }

    showPosts(page: PaginatePage, add: boolean, clickLoad: boolean, startTime: number) {
        const posts = new Array<Post>()
        if (add) {
            // 新加载的一页数据，直接加到已有数据末尾，保留已有数据
            posts.push(...this.component.state.posts)
        }
        for (const item of page.posts) {
            let post = this.getPostForShow(item);
            posts.push(post)
        }
        consoleObjDebug("Index update", posts)
        const update = () => {
            this.component.setState({
                loading: false,
                loadHint: getLoadHint(posts.length, page.data.totalPosts),
                posts: posts,
                totalPostsSize: page.data.totalPosts
            })
        }
        if ((!add && this.firstLoadingDelay) || (add && clickLoad)) {
            runAfterMinimalTime(startTime, () => {
                update()
            })
        } else {
            update()
        }
    }

    private getPostForShow(item: ApiPost) {
        let author = item.author;
        if (this.component.props.category == SECTION_TYPE_POETRY.identifier && item.moreDate.length > 0) {
            author = item.moreDate + " " + item.author;
        }
        let cover = item.cover;
        if (item["index-cover"].length > 0) {
            cover = item["index-cover"];
        }
        const post = {
            title: item.title,
            author: author,
            actor: item.actor.length == 0 ? [] : item.actor.split(" "),
            mention: item.mention.length == 0 ? [] : item.mention.split(" "),
            date: item.date,
            path: item.path,
            description: item.description,
            cover: cover,
            coverAlt: item["cover-alt"],
            pin: item.pin == "true",
            hide: item.hide == "true"
        };
        return post;
    }

    abortLoad() {
        if (this.abortController != null) this.abortController.abort()
        if (this.component.state.loading)
            this.component.setState({
                loading: false
            })
    }

    loadMore(clickLoad: boolean = false) {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT && this.cachedPage!!.length == 0) {
            this.init()
            return
        }
        const nextPagePath = this.cachedPage!![this.cachedPage!!.length - 1].data.nextPagePath
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
        if (this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        fetch(request, { signal: this.abortController.signal, cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index load page", page)
                this.cachedPage!!.push(page)
                this.showPosts(page, true, clickLoad, startTime)
            }).catch(error => {
                consoleError(error)
                runAfterMinimalTime(startTime, () => {
                    this.component.setState({
                        loading: false,
                        loadHint: ERROR_HINT
                    })
                })
            }
            )
    }

    isLastPage() {
        if (this.cachedPage == null) return false
        return this.cachedPage[this.cachedPage.length - 1].data.nextPagePath.length == 0
    }
}