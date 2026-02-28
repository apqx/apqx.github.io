import { consoleDebug, consoleObjDebug } from "../../../util/log"
import { ERROR_HINT, getLoadHint } from "../../react/LoadingHint"
import { BaseExternalStore } from "./BaseExternalStore"
import type { BaseHttpPaginator } from "./BaseHttpPaginator"
import type { BasePaginateViewModelState } from "./bean/BasePaginateViewModelState"

/**
 * H, 从接口获取的原始数据类型；P，分页加载器类型，必须继承自 BaseHttpPaginator；T，转换后供组件显示的数据类型
 */
export class HttpPaginatorViewModel<H, P extends BaseHttpPaginator<H, T>, T> extends BaseExternalStore {
    paginator: P
    state: BasePaginateViewModelState<T>

    constructor(paginator: P) {
        super()
        this.paginator = paginator
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
            consoleDebug("HttpPaginatorViewModel load")
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
                loadingHint: getLoadHint(posts.length, totalPostsSize),
                posts: posts,
                totalPostsSize: totalPostsSize
            }
            this.emitChange()
        } catch (e) {
            consoleObjDebug("Error loading posts", e)
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
        consoleDebug("HttpPaginatorViewModel loadMore")
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