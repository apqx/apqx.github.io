import { consoleErrorObj, consoleInfo, consoleInfoObj } from "../../../util/log";
import { LOADING_HINT_ERROR, getLoadHint } from "../../react/LoadingHint";
import { BaseExternalStore } from "./BaseExternalStore";
import type { BasePagefindPaginator, BasePagefindPaginatorOptions } from "./BasePagefindPaginator";
import type { BasePaginateViewModelState } from "./bean/BasePaginateViewModelState";

/**
 * P，搜索引擎原始数据类型；T，转换后供组件显示的数据类型；O，分页加载器类型，必须继承自 BasePagefindPaginator
 */
export class PagefindPaginateViewModel<P, T, O extends BasePagefindPaginator<P, T>> extends BaseExternalStore {
    paginator: O
    state: BasePaginateViewModelState<T>
    onlyShowLoadingAndError: boolean

    constructor(paginator: O, onlyShowLoadingAndError: boolean = false) {
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

    async search(keywords: string | null, options: BasePagefindPaginatorOptions, delay: boolean = false): Promise<void> {
        try {
            if (this.state.loading) return
            consoleInfo("PagefindPaginateViewModel search, keywords = " + keywords)
            // 应过滤搜索词为空的搜索行为，当词为 null 字符时，pagefind 会返回全部数据
            if (keywords?.length == 0) {
                this.state = {
                    loading: false,
                    loadingHint: undefined,
                    posts: [],
                    totalPostsSize: 0
                }
                this.emitChange()
                return
            }
            this.state = {
                ...this.state,
                loading: true,
                loadingHint: undefined
            }
            this.emitChange()
            const posts = await this.paginator.search(keywords, options, delay)
            const totalPostsSize = this.paginator.totalPostsSize()
            this.state = {
                loading: false,
                loadingHint: posts.length > 0 && this.onlyShowLoadingAndError ? undefined : getLoadHint(posts.length, totalPostsSize),
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
        } catch (e) {
            consoleInfoObj("Error searching posts", e)
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
        consoleInfo("PagefindPaginateViewModel loadMore")
        try {
            this.state = {
                ...this.state,
                loading: true,
                loadingHint: undefined
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

    clear(): void {
        this.state = {
            loading: false,
            loadingHint: undefined,
            posts: [],
            totalPostsSize: 0
        }
        this.emitChange()
    }

    abort(): void {
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