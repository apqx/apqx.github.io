import { MDCRipple } from "@material/ripple";
import React from "react";
import ReactDOM from "react-dom";
import { ERROR_HINT, LoadingHint } from "./LoadingHint";
import { IndexListPresenter } from "./IndexListPresenter";
import { consoleDebug } from "../../util/log";
import { ScrollLoader } from "../../base/ScrollLoader";

export type Post = {
    title: string,
    author: string,
    date: string,
    path: string,
    pin: boolean,
    hide: boolean
}

interface Props {
    category: string,
    pinedPosts: Array<Post>,
    loadedPosts: Array<Post>,
    onUpdate: () => void
}

interface State {
    loading: boolean,
    loadHint: string,
    posts: Array<Post>
}

export class IndexList extends React.Component<Props, State> {
    presenter: IndexListPresenter

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            loadHint: null,
            posts: this.props.loadedPosts
        }
        this.presenter = new IndexListPresenter(this)
        this.onClickLoadMore = this.onClickLoadMore.bind(this)
        consoleDebug("Index scroll " + window.innerHeight + " : " + document.body.clientHeight)
    }

    componentDidMount(): void {
        this.presenter.init()
        this.initScroll()
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

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        this.props.onUpdate()
    }

    onClickLoadMore() {
        this.presenter.loadMore()
    }

    render() {
        return (
            <ul className="index-ul">
                {this.props.pinedPosts.map((post) =>
                    <IndexItem key={post.title + post.date}
                        title={post.title} author={post.author} date={post.date} path={post.path} pin={post.pin} 
                        last={false} />
                )}
                {this.state.posts.map((post, index) =>
                    // 隐藏部分post
                    !post.pin && !post.hide && <IndexItem key={post.title + post.date}
                        title={post.title} author={post.author} date={post.date} path={post.path} pin={post.pin}
                        last={index == this.state.posts.length - 1} />
                )}
                {(this.state.loading || this.state.loadHint != null) &&
                    <div className="center">
                        <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.onClickLoadMore} />
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
        const rootE = ReactDOM.findDOMNode(this) as HTMLElement;
        if (this.props.pin) {
            rootE.classList.add("index-li--pin")
        }
        new MDCRipple(rootE.querySelector(".index-card"))
    }

    render() {
        return (
            <li className="index-li">
                <a className="index-a" href={this.props.path}>
                    <section className="mdc-card index-card">
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