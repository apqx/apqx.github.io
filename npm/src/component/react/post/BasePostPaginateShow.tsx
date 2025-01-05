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
    posts: Array<Post>
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

export abstract class BasePostPaginateShow<P extends BasePostPaginateShowProps> extends React.Component<P, BasePostPaginateShowState> implements IPostPaginateShow {
    presenter: IPostPaginateShowPresenter

    constructor(props: P) {
        super(props)
        this.presenter = this.createPresenter()
        this.state = {
            loading: true,
            loadHint: null,
            posts: this.props.loadedPosts
        }
        this.loadMore = this.loadMore.bind(this)
    }

    componentDidMount(): void {
        this.loadFirstPage()
    }

    abstract createPresenter(): IPostPaginateShowPresenter

    abstract loadFirstPage()

    abstract loadMore()

    abstract destroy()
}