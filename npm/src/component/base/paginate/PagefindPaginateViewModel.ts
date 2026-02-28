import { consoleDebug, consoleObjDebug } from "../../../util/log";
import { ERROR_HINT, getLoadHint } from "../../react/LoadingHint";
import { BaseExternalStore } from "./BaseExternalStore";
import type { BasePagefindPaginator, BasePagefindPaginatorOptions } from "./BasePagefindPaginator";
import type { BasePaginateViewModelState } from "./bean/BasePaginateViewModelState";

/**
 * P，搜索引擎原始数据类型；T，转换后供组件显示的数据类型；O，分页加载器类型，必须继承自 BasePagefindPaginator
 */
export class PagefindPaginateViewModel<P, T, O extends BasePagefindPaginator<P, T>> extends BaseExternalStore {
    paginator: O
    state: BasePaginateViewModelState<T>

    constructor(paginator: O) {
        super()
        this.paginator = paginator
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
            consoleDebug("PagefindPaginateViewModel search, keywords = " + keywords)
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
                loadingHint: getLoadHint(posts.length, totalPostsSize),
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
        } catch (e) {
            consoleObjDebug("Error searching posts", e)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: ERROR_HINT
            }
            this.emitChange()
        }
    }

    async loadMore(delay: boolean = false): Promise<void> {
        if (this.state.loading) return
        if (!this.paginator.hasMore()) return
        consoleDebug("PagefindPaginateViewModel loadMore")
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
                loading: false,
                loadingHint: getLoadHint(posts.length, totalPostsSize),
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
        } catch (e) {
            consoleObjDebug("Error loading more posts", e)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: ERROR_HINT
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