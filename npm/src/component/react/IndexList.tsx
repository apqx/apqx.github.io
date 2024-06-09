import { MDCRipple } from "@material/ripple";
import React from "react";
import ReactDOM from "react-dom";
import { ERROR_HINT, LoadingHint } from "./LoadingHint";
import { consoleDebug } from "../../util/log";
import { ScrollLoader } from "../../base/ScrollLoader";
import { BasePostPaginateShow, BasePostPaginateShowProps, BasePostPaginateShowState } from "./post/BasePostPaginateShow";
import { PostPaginateShowPresenter } from "./post/PostPaginateShowPresenter";
import { IPostPaginateShowPresenter } from "./post/IPostPaginateShowPresenter";

export class IndexList extends BasePostPaginateShow<BasePostPaginateShowProps> {

    createPresenter(): IPostPaginateShowPresenter {
        return new PostPaginateShowPresenter(this)
    }

    componentDidMount(): void {
        super.componentDidMount()
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
    }

    loadFirstPage() {
        this.presenter.init()
    }

    initScroll() {
        const scrollLoader = new ScrollLoader(() => {
            consoleDebug("Index scroll should load")
            if (this.state.loadHint == ERROR_HINT) return
            this.presenter.loadMore()
        })
        window.addEventListener("scroll", () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        })
    }

    componentDidUpdate(prevProps: Readonly<BasePostPaginateShowProps>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    loadMore() {
        this.presenter.loadMore()
    }

    destroy() {
        this.presenter.destroy()
    }

    render() {
        return (
            <ul className="index-ul">
                {this.props.pinedPosts.map((post) =>
                    <IndexItem key={post.path}
                        title={post.title} author={post.author} date={post.date} path={post.path} pin={post.pin}
                        last={false} />
                )}
                {this.state.posts.map((item, index) =>
                    // 隐藏部分post
                    // 有时候jekyll生成的path和paginate生成的path不一样，导致item重新加载
                    !item.pin && !item.hide && <IndexItem key={item.path}
                        title={item.title} author={item.author} date={item.date} path={item.path} pin={item.pin}
                        last={index == this.state.posts.length - 1} />
                )}
                {(this.state.loading || this.state.loadHint != null) &&
                    <div className="center">
                        <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMore} />
                    </div>
                }
            </ul>
        )
    }
}

export type IndexItemProps = {
    title: string,
    author: string,
    date: string,
    path: string,
    pin: boolean,
    last: boolean
}

class IndexItem extends React.Component<IndexItemProps, any> {
    constructor(props: IndexItemProps) {
        super(props);
    }

    componentDidMount(): void {
        consoleDebug("IndexItem componentDidMount " + this.props.title)
        const rootE = ReactDOM.findDOMNode(this) as HTMLElement;
        if (this.props.pin) {
            rootE.classList.add("index-li--pin")
        }
        new MDCRipple(rootE.querySelector(".index-card"))
    }

    componentWillUnmount(): void {
        consoleDebug("IndexItem componentWillUnmount " + this.props.title)
    }

    render() {
        return (
            <li className="index-li">
                <a className="index-a mdc-card index-card" href={this.props.path}>
                    <section>
                        <h1 className="index-title one-line">{this.props.title}</h1>
                        <span className="index-author">{this.props.author}</span>
                        <span className="index-date">{this.props.date}</span>
                        {this.props.pin &&
                            <i className="material-symbols-rounded index-pin-icon">attach_file</i>
                        }
                    </section>
                </a>
                {!this.props.last && <div className="index-li-divider" />}
            </li>
        )
    }
}