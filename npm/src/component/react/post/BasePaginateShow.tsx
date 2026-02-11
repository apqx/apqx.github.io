import React from "react"
import type { RefObject } from "react"
import type { IPostPaginateShow } from "./IPaginateShow"
import type { IPaginateShowPresenter } from "./IPaginateShowPresenter"
import { consoleDebug } from "../../../util/log"

export interface BasePaginateShowProps<T> {
    category: string,
    tag: string,
    pinnedPosts: Array<T>,
    loadedPosts: Array<T>,
    onMount?: () => void,
    onUpdate?: () => void
}

export interface BasePaginateShowState<T> {
    loading: boolean,
    loadHint?: string,
    posts: Array<T>,
    totalPostsSize: number
}

/**
 * D, 要加载的数据类型
 * P, 组件的props类型
 */
export abstract class BasePaginateShow<D, P extends BasePaginateShowProps<D>>
    extends React.Component<P, BasePaginateShowState<D>> implements IPostPaginateShow {

    presenter: IPaginateShowPresenter
    loadFirstPageOnMount: boolean = true

    constructor(props: P) {
        super(props)
        this.presenter = this.createPresenter()
        this.state = {
            loading: true,
            loadHint: undefined,
            posts: this.props.loadedPosts,
            totalPostsSize: 0
        }
        this.loadMore = this.loadMore.bind(this)
        this.loadMoreByClick = this.loadMoreByClick.bind(this)
    }

    componentDidMount(): void {
        if (this.loadFirstPageOnMount) {
            this.loadFirstPage()
        }
        if (this.props.onMount != null) {
            this.props.onMount()
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<BasePaginateShowState<D>>, snapshot?: any): void {
        if (this.props.onUpdate != null) {
            this.props.onUpdate()
        }
    }

    abstract createPresenter(): IPaginateShowPresenter

    abortLoad() {
        consoleDebug("BasePostPaginateShow abortLoad")
        this.presenter.abortLoad()
    }

    loadFirstPage() {
        consoleDebug("BasePostPaginateShow loadFirstPage")
        this.presenter.init()
    }

    loadMore() {
        consoleDebug("BasePostPaginateShow loadMore")
        this.presenter.loadMore(false)
    }

    loadMoreByClick() {
        consoleDebug("BasePostPaginateShow loadMoreByClick")
        this.presenter.loadMore(true)
    }

    destroy() {
        this.presenter.destroy()
    }
}