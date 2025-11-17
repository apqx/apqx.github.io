// import "./IndexList.scss"
import { MDCRipple } from "@material/ripple"
import React from "react"
import type { RefObject } from "react"
import { ERROR_HINT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { ScrollLoader } from "../../base/ScrollLoader"
import { BasePostPaginateShow } from "./post/BasePostPaginateShow"
import type { BasePostPaginateShowProps, BasePostPaginateShowState } from "./post/BasePostPaginateShow"
import { PostPaginateShowPresenter } from "./post/PostPaginateShowPresenter"
import type { IPostPaginateShowPresenter } from "./post/IPostPaginateShowPresenter"
import { showFooter } from "../footer"
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"

export class IndexList extends BasePostPaginateShow<BasePostPaginateShowProps> {

    createPresenter(): IPostPaginateShowPresenter {
        return new PostPaginateShowPresenter(this, false)
    }

    componentDidMount(): void {
        super.componentDidMount()
        // 不使用高度动画
        // this.heightAnimationContainer = new HeightAnimationContainer(rootE)
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
        // 显示footer，在索引页其被默认隐藏，需要在列表首次加载后显示出来
        showFooter()
    }

    initScroll() {
        const scrollLoader = new ScrollLoader(() => {
            consoleDebug("Index scroll should load")
            if (this.state.loadHint == ERROR_HINT) return
            this.loadMore()
        })
        window.addEventListener("scroll", () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        })
    }

    componentDidUpdate(prevProps: Readonly<BasePostPaginateShowProps>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render() {
        return (
            <ul className="index-ul">
                {this.props.pinedPosts.map((post) =>
                    <IndexItem key={post.title + post.date}
                        title={post.title} author={post.author} date={post.date} description={post.description} path={post.path} pin={post.pin}
                        last={false} />
                )}
                {this.state.posts.map((item, index) =>
                    // 隐藏部分post
                    // 有时候jekyll生成的path和paginate生成的path不一样，导致item重新加载
                    !item.hide && <IndexItem key={item.path}
                        title={item.title} author={item.author} date={item.date} description={item.description} path={item.path} pin={false}
                        last={index == this.state.posts.length - 1} />
                )}
                {(this.state.loading || this.state.loadHint != null) &&
                    <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                }
            </ul>
        )
    }
}

export type IndexItemProps = {
    title: string,
    author: string,
    date: string,
    description: string,
    path: string,
    pin: boolean,
    last: boolean
}

class IndexItem extends React.Component<IndexItemProps, any> {
    private containerRef: RefObject<HTMLLIElement | null> = React.createRef()

    cardE: HTMLElement | null = null

    constructor(props: IndexItemProps) {
        super(props);
    }

    componentDidMount(): void {
        consoleObjDebug("IndexItem componentDidMount", this.props)
        const rootE = this.containerRef.current as HTMLElement;
        this.cardE = rootE.querySelector(".index-card")

        if (this.props.pin) {
            rootE.classList.add("index-li--pin")
        }
        new MDCRipple(this.cardE!!)
        // 监听元素进入窗口初次显示
        // TODO: 执行动画后应该立即解除监听，避免不必要的性能开销
        if (this.cardE != null) {
            getInterSectionObserver().observe(this.cardE)
        }
    }

    componentWillUnmount(): void {
        consoleDebug("IndexItem componentWillUnmount " + this.props.title)
        if (this.cardE != null) {
            getInterSectionObserver().unobserve(this.cardE)
        }
    }

    render() {
        const date = getSplittedDate(this.props.date);
        return (
            <li ref={this.containerRef} className="index-li">
                <a className={`index-a mdc-card index-card card-slide-in ${this.props.last ? "list-last" : ""}`} href={this.props.path}>
                    <section>
                        <h1 className="index-title">{this.props.title}</h1>
                        <span className="index-author">{this.props.author}</span>
                        <span className="index-date">
                            {date.year}<span className="year">年</span>
                            {date.month}<span className="month">月</span>
                            {date.day}<span className="day">日</span>
                        </span>
                        {this.props.pin &&
                            <i className="material-symbols-rounded-light index-pin-icon">keep</i>
                        }
                    </section>
                </a>
                {!this.props.last && <hr className="index-li-divider" />}
            </li>
        )
    }
}


class IndexItemWithDesc extends React.Component<IndexItemProps, any> {
    private containerRef: RefObject<HTMLLIElement | null> = React.createRef()

    cardE: HTMLElement | null = null

    constructor(props: IndexItemProps) {
        super(props);
    }

    componentDidMount(): void {
        consoleObjDebug("IndexItemWithDescription componentDidMount", this.props)
        const rootE = this.containerRef.current as HTMLElement;
        this.cardE = rootE.querySelector(".index-card")

        if (this.props.pin) {
            rootE.classList.add("index-li--pin")
        }
        new MDCRipple(this.cardE!!)
        // 监听元素进入窗口初次显示
        if (this.cardE != null) {
            getInterSectionObserver().observe(this.cardE)
        }
    }

    componentWillUnmount(): void {
        consoleDebug("IndexItemWithDescription componentWillUnmount " + this.props.title)
        if (this.cardE != null) {
            getInterSectionObserver().unobserve(this.cardE)
        }
    }

    render() {
        return (
            <li ref={this.containerRef} className="index-li index-with-desc">
                <a className="index-a mdc-card index-card card-slide-in" href={this.props.path}>
                    <section>
                        <h1 className="index-width-desc-title">{this.props.title}</h1>
                        <span className="index-with-desc-date">{this.props.date} {this.props.author}</span>
                        <span className="index-width-desc-desc">{this.props.description}</span>
                    </section>
                </a>
                {!this.props.last && <hr className="index-li-divider" />}
            </li>
        )
    }
}