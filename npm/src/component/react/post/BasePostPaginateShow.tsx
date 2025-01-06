import React from "react"
import { IPostPaginateShow } from "./IPostPaginateShow"
import { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter"

export interface BasePostPaginateShowProps {
    category: string,
    tag: string,
    pinedPosts: Array<Post>,
    loadedPosts: Array<Post>,
    onUpdate: () => void
}

export interface BasePostPaginateShowState {
    loading: boolean,
    loadHint: string,
    posts: Array<Post>,
    totalPostsSize: number
}

export type Post = {
    title: string,
    author: string,
    actor: Array<string>,
    mention: Array<string>,
    date: string,
    path: string,
    description: string,
    cover: string,
    coverAlt: string,
    pin: boolean,
    hide: boolean
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
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        if (this.props.onUpdate != null) {
            this.props.onUpdate()
        }
    }

    abstract createPresenter(): IPostPaginateShowPresenter

    loadFirstPage() {
        this.presenter.init()
    }

    loadMore() {
        this.presenter.loadMore(false)
    }

    loadMoreByClick() {
        this.presenter.loadMore(true)
    }

    destroy() {
        this.presenter.destroy()
    }
}