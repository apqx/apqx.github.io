import { consoleErrorObj, consoleInfo, consoleInfoObj } from "../../../util/log"
import { LOADING_HINT_ERROR, getLoadHint } from "../../react/LoadingHint"
import { BaseExternalStore } from "./BaseExternalStore"
import type { BaseHttpPaginator } from "./BaseHttpPaginator"
import type { BasePaginateViewModelState } from "./bean/BasePaginateViewModelState"

/**
 * H, 从接口获取的原始数据类型；P，分页加载器类型，必须继承自 BaseHttpPaginator；T，转换后供组件显示的数据类型
 */
export class HttpPaginatorViewModel<H, P extends BaseHttpPaginator<H, T>, T> extends BaseExternalStore {
    paginator: P
    state: BasePaginateViewModelState<T>
    onlyShowLoadingAndError: boolean

    constructor(paginator: P, onlyShowLoadingAndError: boolean = false) {
        super()
        this.paginator = paginator
        this.onlyShowLoadingAndError = onlyShowLoadingAndError
        this.state = {
            loading: false,
            loadingHint: undefined,
            posts: [],
            totalPostsSize: 0
        }
    }

    async load(delay: boolean = false): Promise<void> {
        try {
            if (this.state.loading) return
            consoleInfo("HttpPaginatorViewModel load")
            this.state = {
                loading: true,
                loadingHint: undefined,
                posts: [],
                totalPostsSize: 0
            }
            this.emitChange()
            const posts = await this.paginator.load(delay)
            const totalPostsSize = this.paginator.totalPostsSize()
            this.state = {
                loading: false,
                loadingHint: posts.length > 0 && this.onlyShowLoadingAndError ? undefined : getLoadHint(posts.length, totalPostsSize),
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
        } catch (e) {
            consoleInfoObj("Error loading posts", e)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: LOADING_HINT_ERROR
            }
            this.emitChange()
        }
    }

    async loadMore(delay: boolean = false): Promise<void> {
        if (this.state.loading) return
        if (!this.paginator.hasMore()) return
        consoleInfo("HttpPaginatorViewModel loadMore")
        try {
            this.state = {
                ...this.state,
                loading: true,
                loadingHint: ""
            }
            this.emitChange()
            const posts = await this.paginator.loadMore(delay)
            const totalPostsSize = this.paginator.totalPostsSize()
            this.state = {
                ...this.state,
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
            // loading 状态的解除延时一段时间，尽量在新数据的布局完成之后，避免 loading 组件的 intersection 过早触发，从而导致加载更多的请求过多
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.state = {
                        ...this.state,
                        loading: false,
                        loadingHint: posts.length > 0 && this.onlyShowLoadingAndError ? undefined : getLoadHint(posts.length, totalPostsSize),
                    }
                    this.emitChange()
                })
            })
            this.emitChange()
        } catch (e) {
            consoleErrorObj("Error loading more posts", e)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: LOADING_HINT_ERROR
            }
            this.emitChange()
        }
    }

    clear() {
        this.state = {
            loading: false,
            loadingHint: undefined,
            posts: [],
            totalPostsSize: 0
        }
        this.emitChange()
    }

    abort() {
        this.paginator.abort()
        if (this.state.loading) {
            this.state = {
                ...this.state,
                loading: false,
            }
            this.emitChange()
        }
    }

}