// import "./LensIndexList.scss"
import type { ReactNode } from "react"
import React, { useEffect, useRef } from "react"
import { MDCRipple } from "@material/ripple"
import { ImageLoadAnimator } from "../animation/ImageLoadAnimator"
import { ERROR_HINT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { BasePaginateShow } from "./post/BasePaginateShow"
import type { BasePaginateShowProps, BasePaginateShowState } from "./post/BasePaginateShow"
import type { IPaginateShowPresenter } from "./post/IPaginateShowPresenter"
import { BasePaginateShowPresenter } from "./post/BasePaginateShowPresenter"
import { setupTagTrigger } from "../tag"
import { ScrollLoader } from "../../base/ScrollLoader"
import Masonry from 'react-masonry-css'
import { showFooter } from "../footer"
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { PostPaginateShowPresenter, type Post } from "./post/PostPaginateShowPresenter"



export class LensIndexList extends BasePaginateShow<Post, BasePaginateShowProps<Post>> {

    constructor(props: BasePaginateShowProps<Post>) {
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
        consoleDebug("LensIndex componentDidMount")
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
        // 显示footer，在索引页其被默认隐藏，需要在列表首次加载后显示出来
        showFooter()
    }

    componentDidUpdate(prevProps: Readonly<BasePaginateShowProps<Post>>, prevState: Readonly<BasePaginateShowState<Post>>, snapshot?: any): void {
        consoleDebug("LensIndex componentDidUpdate")
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render(): ReactNode {
        const breakpointColumnsObj = {
            default: 3,
            950: 2,
            300: 1
        }
        return (
            <ul className="grid-index-ul">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">
                    {this.state.posts.map((item: Post, index: number) =>
                        !item.pinned && !item.hidden &&
                        <IndexItem key={item.path}
                            index={index}
                            title={item.title}
                            actor={item.actor}
                            date={item.date}
                            path={item.path}
                            cover={item.cover}
                            last={index == this.state.posts.length - 1}
                            coverLoadedCallback={() => { }} />
                    )}
                </Masonry>
                {(this.state.loading || this.state.loadHint != null) &&
                    <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                }
            </ul>
        )
    }
}

type IndexItemProps = {
    index: number,
    title: string,
    actor: Array<string>,
    date: string,
    path: string,
    cover: string,
    last: boolean,
    coverLoadedCallback: () => void
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleObjDebug("IndexItem componentDidMount", props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card")
        new MDCRipple(cardE!!)

        const imgE = rootE.querySelector(".grid-index-cover.image-height-animation")
        // 图片加载动画
        let imageLoadAnimator: ImageLoadAnimator | null = null
        if (imgE != null) {
            // 每行 3 个 item，第一行动画依次执行
            if (props.index < 3) {
                setInterval(() => {
                    imageLoadAnimator = new ImageLoadAnimator(imgE as HTMLImageElement, -1, false,
                        () => {
                            // 仅在用户未滚动时的第一页执行动画，否则是不可见的无需动画
                            return window.scrollY <= 0
                        },
                        () => {
                            // 图片尺寸动画执行完成
                            props.coverLoadedCallback()
                        })
                }, 50 * (props.index + 1))
            } else {
                imageLoadAnimator = new ImageLoadAnimator(imgE as HTMLImageElement, -1, false,
                    () => {
                        // 仅在用户未滚动时的第一页执行动画，否则是不可见的无需动画
                        return window.scrollY <= 0
                    },
                    () => {
                        // 图片尺寸动画执行完成
                        props.coverLoadedCallback()
                    })
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

    const actorStr = props.actor.join(" ")
    const animationClass = props.index == 0 ? "card-fade-in" : "card-slide-in-middle"

    const date = getSplittedDate(props.date);

    return (
        <li ref={containerRef} className="grid-index-li">
            {/* 第一个元素使用 fade-in 动画，避免在小尺寸手机上因为 slide 距离在页面初次加载时不触发动画 */}
            <a className={"index-a mdc-card grid-index-card grid-index-card__ripple " + animationClass} href={props.path}>
                <section className="lens-index-container">
                    <img className="grid-index-cover image-height-animation" loading="lazy" src={props.cover} />
                    <div className="lens-index-text-container">
                        <div className="lens-index-date">
                            {date.year}{date.month}
                        </div>
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
