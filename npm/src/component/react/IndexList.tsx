// import "./IndexList.scss"
import { MDCRipple } from "@material/ripple"
import React, { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { ERROR_HINT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { ScrollLoader } from "../../base/ScrollLoader"
import { BasePaginateShow } from "./post/BasePaginateShow"
import type { BasePaginateShowProps, BasePaginateShowState } from "./post/BasePaginateShow"
import { BasePaginateShowPresenter } from "./post/BasePaginateShowPresenter"
import type { IPaginateShowPresenter } from "./post/IPaginateShowPresenter"
import { showFooter } from "../footer"
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { PostPaginateShowPresenter, type Post } from "./post/PostPaginateShowPresenter"

export class IndexList extends BasePaginateShow<Post, BasePaginateShowProps<Post>> {

    createPresenter(): IPaginateShowPresenter {
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

    componentDidUpdate(prevProps: Readonly<BasePaginateShowProps<Post>>, prevState: Readonly<BasePaginateShowState<Post>>, snapshot?: any): void {
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render() {
        return (
            <ul className="index-ul">
                {/* 置顶文章 */}
                {this.props.pinnedPosts.map((post) =>
                    <IndexItem key={post.title + post.date}
                        title={post.title} author={post.author} date={post.date} description={post.description} path={post.path}
                        fromPinnedList={true} pinned={true} featured={post.featured} last={false} />
                )}
                {/* 普通文章 */}
                {this.state.posts.map((item, index) =>
                    // 隐藏部分 post
                    // 有时候 jekyll 生成的 path 和 paginate 生成的 path 不一样，导致 item 重新加载
                    !item.hidden && <IndexItem key={item.path}
                        title={item.title} author={item.author} date={item.date} description={item.description} path={item.path}
                        fromPinnedList={false} pinned={item.pinned} featured={item.featured} last={index == this.state.posts.length - 1} />
                )}
                {(this.state.loading || this.state.loadHint != null) &&
                    <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                }
            </ul>
        )
    }
}

type IndexItemProps = {
    title: string,
    author: string,
    date: string,
    description: string,
    path: string,
    fromPinnedList: boolean,
    pinned: boolean,
    featured: boolean,
    last: boolean
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    const cardE = useRef<HTMLElement>(null)
    const date = getSplittedDate(props.date);

    useEffect(() => {
        consoleObjDebug("IndexItem component mounted", props)
        const rootE = containerRef.current as HTMLElement;
        cardE.current = rootE.querySelector(".index-card")

        new MDCRipple(cardE.current!!)
        // 监听元素进入窗口初次显示
        // TODO: 执行动画后应该立即解除监听，避免不必要的性能开销
        if (cardE.current != null) {
            getInterSectionObserver().observe(cardE.current)
        }

        return () => {
            consoleDebug("IndexItem component unmount " + props.title)
            if (cardE.current != null) {
                getInterSectionObserver().unobserve(cardE.current)
            }
        }
    }, [])

    return (
        <li ref={containerRef} className="index-li">
            <a className={`index-a mdc-card index-card card-slide-in ${props.last ? "list-last" : ""}`} href={props.path}>
                <section>
                    <h1 className="index-title">{props.title}</h1>
                    <span className="index-author">{props.author}</span>
                    <span className="index-date">
                        {date.year}<span className="year">年</span>
                        {date.month}<span className="month">月</span>
                        {date.day}<span className="day">日</span>
                    </span>
                    {props.fromPinnedList &&
                        <span className="index-pinned-icon-container"><i className="material-symbols-rounded-light">keep</i></span>
                    }
                    {!props.fromPinnedList && (props.pinned || props.featured) &&
                        <span className="index-featured-icon-container"><i className="material-symbols-rounded-light">editor_choice</i></span>
                    }
                </section>
            </a>
            {!props.last && <hr className="index-li-divider" />}
        </li>
    )
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
                        {/* <span className="index-with-desc-date">{this.props.date} {this.props.author}</span> */}
                        <span className="index-width-desc-desc">{this.props.description}</span>
                    </section>
                </a>
                {!this.props.last && <hr className="index-li-divider" />}
            </li>
        )
    }
}