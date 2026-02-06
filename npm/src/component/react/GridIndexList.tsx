// import "./GridIndexList.scss"
import type { ReactNode } from "react"
import React, { useEffect, useMemo, useRef } from "react"
import { ImageLoadAnimator } from "../animation/ImageLoadAnimator"
import { ERROR_HINT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { BasePaginateShow } from "./post/BasePaginateShow"
import type { BasePaginateShowProps, BasePaginateShowState } from "./post/BasePaginateShow"
import type { IPaginateShowPresenter } from "./post/IPaginateShowPresenter"
import { onTagTriggerClick, setupTagTrigger } from "../tag"
import { ScrollLoader } from "../../base/ScrollLoader"
import Masonry from 'react-masonry-css'
import { showFooter } from "../footer"
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { PostPaginateShowPresenter, type Post } from "./post/PostPaginateShowPresenter"
import { setupCardRipple } from "../card"

interface Props extends BasePaginateShowProps<Post> {
    pageDescriptionHtml: string
}

export class GridIndexList extends BasePaginateShow<Post, Props> {

    constructor(props: Props) {
        super(props)
    }

    createPresenter(): IPaginateShowPresenter {
        return new PostPaginateShowPresenter(this, false)
    }

    initScroll() {
        const scrollLoader = new ScrollLoader(() => {
            consoleDebug("Index scroll should check load more")
            if (this.state.loadHint == ERROR_HINT) return
            this.loadMore()
        })
        window.addEventListener("scroll", () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        })
    }

    componentDidMount(): void {
        super.componentDidMount()
        consoleDebug("GridIndex componentDidMount")
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
        // 显示footer，在索引页其被默认隐藏，需要在列表首次加载后显示出来
        showFooter()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<BasePaginateShowState<Post>>, snapshot?: any): void {
        consoleDebug("GridIndex componentDidUpdate")
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render(): ReactNode {
        const breakpointColumnsObj = {
            default: 2,
            600: 1
        }
        return (
            <ul className="grid-index-ul">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">
                    {this.props.pageDescriptionHtml != null && this.props.pageDescriptionHtml.length > 0 &&
                        <IndexDescriptionItem innerHtml={this.props.pageDescriptionHtml} />
                    }
                    {this.state.posts.map((item: Post, index: number) =>
                        // TODO: 有时候jekyll生成的path和paginate生成的path不一样，导致item重新加载，这种情况并不多
                        !item.hidden &&
                        <IndexItem key={item.path}
                            index={index}
                            title={item.title}
                            author={item.author}
                            actor={item.actor}
                            date={item.date}
                            path={item.path}
                            description={item.description}
                            cover={item.cover}
                            coverAlt={item.coverAlt}
                            last={index == this.state.posts.length - 1}
                            coverLoadedCallback={() => { }} />
                    )}
                    {(this.state.loading || this.state.loadHint != null) &&
                        <li className="grid-index-li">
                            <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                        </li>
                    }
                </Masonry>
            </ul>
        )
    }
}

type IndexItemProps = {
    index: number,
    title: string,
    author: string,
    actor: Array<string>,
    date: string,
    path: string,
    description: string,
    cover: string,
    coverAlt: string,
    last: boolean,
    coverLoadedCallback: () => void
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleObjDebug("IndexItem componentDidMount", props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card")
        setupCardRipple(cardE)

        const imgE = rootE.querySelector(".grid-index-cover.image-height-animation")
        // 图片加载动画
        let imageLoadAnimator: ImageLoadAnimator | null = null
        if (imgE != null) {
            // 前 2 个元素依次执行动画
            if (props.index < 2) {
                setTimeout(() => {
                    imageLoadAnimator = startImageAnimation(imgE as HTMLImageElement)
                }, 50 * props.index)
            } else {
                imageLoadAnimator = startImageAnimation(imgE as HTMLImageElement)
            }
        }

        // 监听元素进入窗口初次显示
        if (cardE != null) {
            getInterSectionObserver().observe(cardE)
        }

        return () => {
            consoleDebug("IndexItem componentWillUnmount " + props.title)
            if (imageLoadAnimator != null) {
                imageLoadAnimator.destroy()
            }
            if (cardE != null) {
                getInterSectionObserver().unobserve(cardE)
            }
        }
    }, [])

    function startImageAnimation(imgE: HTMLImageElement): ImageLoadAnimator | null {
        return new ImageLoadAnimator(imgE, -1, false,
            () => {
                // 仅在用户未滚动时的第一页执行动画，否则是不可见的无需动画
                return window.scrollY <= 0
            },
            () => {
                // 图片尺寸动画执行完成
                props.coverLoadedCallback()
            })
    }

    const actorStr = useMemo(() => props.actor.join(" "), [props.actor])
    const animationClass = useMemo(() => props.index == 0 ? "card-fade-in" : "card-slide-in-middle", [props.index])

    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    return (
        <li ref={containerRef} className="grid-index-li">
            {/* 第一个元素使用 fade-in 动画，避免在小尺寸手机上因为 slide 距离在页面初次加载时不触发动画 */}
            <a className={"index-a mdc-card grid-index-card grid-index-card__ripple " + animationClass} href={props.path}>
                <section>
                    {props.cover != null && props.cover.length > 0 &&
                        <img className="grid-index-cover image-height-animation" loading="lazy" src={props.cover} alt={props.coverAlt} />}
                    {props.cover == null || props.cover.length == 0 &&
                        <div style={{ height: "0.5rem" }}></div>}
                    <div className="grid-index-text-container">
                        <h1 className="grid-index-title">{props.title}</h1>
                        <div>
                            <span className="grid-index-date">
                                {date.year}<span className="year">年</span>
                                {date.month}<span className="month">月</span>
                                {date.day}<span className="day">日</span>
                            </span>
                            <span className="grid-index-author"> {actorStr}</span>
                        </div>
                        <p className="grid-index-description">{props.description}</p>
                    </div>
                </section>
            </a>
            {!props.last && <hr className="grid-index-li-divider" />}
        </li>
    )
}

type IndexDescriptionItemProps = {
    innerHtml: string,
}

function IndexDescriptionItem(props: IndexDescriptionItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        const rootE = containerRef.current as HTMLElement
        consoleObjDebug("IndexDescriptionItem componentDidMount", rootE)
        const cardE = rootE.querySelector(".grid-index-card")
        if (cardE != null) {
            getInterSectionObserver().observe(cardE)
        }

        // 组件内的点击事件都会上浮到容器被捕捉，在这里处理一些非标准 <a> 元素的点击事件
        rootE.addEventListener("click", (event) => {
            consoleObjDebug("IndexDescriptionItem click event ", event.target)
            const targetE = event.target as HTMLElement
            // 处理 tag 点击事件
            if (targetE.classList.contains("tag-dialog-trigger")) {
                onTagTriggerClick(targetE)
            }
        })

        // 对于 dangerouslySetInnerHTML 插入的内容，状态不像普通 react 组件可控，这样设置 click 监听可能失效
        // const dialogsTriggers = rootE.querySelectorAll(".tag-dialog-trigger")
        // consoleDebug("Found tag dialog triggers: " + dialogsTriggers.length)
        // for (const trigger of dialogsTriggers) {
        //     setupTagTrigger(trigger as HTMLElement)
        // }
        return () => {
            consoleDebug("IndexDescriptionItem componentWillUnmount")
            if (cardE != null) {
                getInterSectionObserver().unobserve(cardE)
            }
        }
    }, [])

    return (
        <li ref={containerRef} className="grid-index-li grid-index-li--description">
            <section className="mdc-card grid-index-card card-fade-in" dangerouslySetInnerHTML={{ __html: props.innerHtml }}>

                {/* <div className="grid-index-text-container">
                    <p>2021 年 08 月 08 日，我在博客里开辟这个分区来承载曾经在剧场看过的剧和拍过的剧照，以昆曲为主，使用<a
                        href="/post/original/2021/09/01/基于Jekyll实现博客文章-标签化.html">标签</a>把每一场演出按剧种、剧团、剧目、演员、剧场分类归档。这里每一篇文章既是记录也是分享，亲手按下快门捕捉到的舞台瞬间，如此美丽的戏妆油彩，不应该只我一人看到。
                    </p>
                    <p>关于我与戏剧的渊源以及为什么会喜欢昆曲，参见之前的自述<a
                        href="/post/original/2019/05/18/槐安国内春生酒.html">《槐安国内春生酒》</a>，还有一些由看剧衍生的<a
                            id="chip_tag_看剧&碎念" className="tag-dialog-trigger clickable-empty-link">碎念</a>。</p>
                    <p>只是时常偷懒，日渐事繁，更新剧目不多，我会慢慢整理上传的。</p>
                    <div style={{ marginBottom: "0.2rem" }}>
                        <a id="chip_tag_看剧&杭州" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@杭州</a>
                        <a id="chip_tag_看剧&南京" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@南京</a>
                        <a id="chip_tag_看剧&上海" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@上海</a>
                        <a className="tag-link grid-index-description-tag" href="/section/lens.html" target="_self">@透镜</a>
                        <a className="tag-link grid-index-description-tag" href="https://space.bilibili.com/11037907" target="_blank">@哔哩</a>
                    </div>
                </div> */}
            </section>
            <hr className="grid-index-li-divider" />
        </li>
    )
}