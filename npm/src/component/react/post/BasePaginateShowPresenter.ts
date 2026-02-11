import type { PaginatePage } from "../../../repository/bean/service/ApiPaginatePage";
import { consoleError, consoleObjDebug } from "../../../util/log";
import { runAfterMinimalTime } from "../../../util/tools";
import { BasePaginateShow } from "./BasePaginateShow";
import type { BasePaginateShowProps } from "./BasePaginateShow";
import type { IPaginateShowPresenter } from "./IPaginateShowPresenter";
import { ERROR_HINT, getLoadHint } from "../LoadingHint";
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO, SERVICE_DEBUG_MODE_OFF } from "../../../repository/Service";

/**
 * D, 要加载的数据类型
 */
export abstract class BasePaginateShowPresenter<D> implements IPaginateShowPresenter {
    component: BasePaginateShow<D, BasePaginateShowProps<D>>
    cachedPage?: PaginatePage[]
    firstLoadingDelay: boolean = false
    abortController?: AbortController

    constructor(component: BasePaginateShow<D, BasePaginateShowProps<D>>, firstLoadingDelay: boolean = false) {
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
        if (this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()

        this.getRequest(this.abortController.signal, 1)
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

    /**
     * 使用页码或直接 url 获取分页数据
     */
    getRequest(abortSignal: AbortSignal, page: number, url?: string): Promise<Response> {
        let serviceConfig = { debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: abortSignal }
        // share 资源是由另一个工程输出到云端，本地没有，所以对它不能用调试链接
        if (this.component.props.category == "share") {
            serviceConfig = { debugMode: SERVICE_DEBUG_MODE_OFF, abortSignal: abortSignal }
        }
        if (url == null || url.length == 0) {
            if (this.component.props.tag.length > 0) {
                return getServiceInstance().getPostsByTag(serviceConfig, this.component.props.tag, page)
            } else {
                return getServiceInstance().getPostsByCategory(serviceConfig, this.component.props.category, page)
            }
        } else {
            return getServiceInstance().getPostsByUrl(serviceConfig, url)
        }

    }

    showPosts(page: PaginatePage, add: boolean, clickLoad: boolean, startTime: number) {
        const posts = new Array<D>()
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

    abstract getPostForShow(item: any): D

    // private getPostForShow(item: ApiPost): D {
    //     let author = item.author;
    //     if (this.component.props.category == SECTION_TYPE_POETRY.identifier && item.moreDate.length > 0) {
    //         author = item.moreDate + " " + item.author;
    //     }
    //     let cover = item.cover;
    //     if (item["index-cover"].length > 0) {
    //         cover = item["index-cover"];
    //     }
    //     const post = {
    //         title: item.title,
    //         author: author,
    //         actor: item.actor.length == 0 ? [] : item.actor.split(" "),
    //         mention: item.mention.length == 0 ? [] : item.mention.split(" "),
    //         location: item.location,
    //         date: item.date,
    //         path: item.path,
    //         description: item.description,
    //         cover: cover,
    //         coverAlt: item["index-cover-alt"],
    //         pinned: item.pinned == "true",
    //         featured: item.featured == "true"
    //     };
    //     return post;
    // }

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
            // 列表滚动到底部时，这里会被高频触发
            if (this.component.state.loading != false || this.component.state.loadHint != null) {
                this.component.setState({
                    loading: false,
                    loadHint: undefined
                })
            }
            return
        }
        const startTime = Date.now()
        this.component.setState({
            loading: true
        })

        if (this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        this.getRequest(this.abortController.signal, -1, nextPagePath)
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