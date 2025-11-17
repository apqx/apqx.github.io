import React from "react"
import type { RefObject } from "react"
import type { IPostPaginateShow } from "./IPostPaginateShow"
import type { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter"
import { consoleDebug } from "../../../util/log"

export interface BasePostPaginateShowProps {
    category: string,
    tag: string,
    pinnedPosts: Array<Post>,
    loadedPosts: Array<Post>,
    onMount?: () => void,
    onUpdate?: () => void
}

export interface BasePostPaginateShowState {
    loading: boolean,
    loadHint: string | null,
    posts: Array<Post>,
    totalPostsSize: number
}

export type Post = {
    title: string,
    author: string,
    actor: Array<string>,
    mention: Array<string>,
    location: string,
    date: string,
    path: string,
    description: string,
    cover: string,
    coverAlt: string,
    pinned: boolean,
    featured: boolean,
    hidden: boolean
}

export abstract class BasePostPaginateShow<P extends BasePostPaginateShowProps>
    extends React.Component<P, BasePostPaginateShowState> implements IPostPaginateShow {

    presenter: IPostPaginateShowPresenter
    loadFirstPageOnMount: boolean = true

    constructor(props: P) {
        super(props)
        this.presenter = this.createPresenter()
        this.state = {
            loading: true,
            loadHint: null,
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

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        if (this.props.onUpdate != null) {
            this.props.onUpdate()
        }
    }

    abstract createPresenter(): IPostPaginateShowPresenter

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