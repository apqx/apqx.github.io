// import "./GridIndexList.scss"
import type { ReactNode } from "react"
import React, { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { ImageLoadAnimator } from "../animation/ImageLoadAnimator"
import { ERROR_HINT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { onTagTriggerClick } from "../tag"
import { ScrollLoader } from "../../base/ScrollLoader"
import Masonry from 'react-masonry-css'
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { setupCardRipple } from "../card"
import type { Post } from "../base/paginate/bean/Post"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"

interface Props extends BasePaginateViewProps<Post> {
    pageDescriptionHtml: string
}

export function IndexGridPosts(props: Props) {
    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options))
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    const onMount = useMemo(() => props.onMount, [props.onMount])

    useEffect(() => {
        consoleDebug(`IndexGridPosts useEffect, tag: ${props.tag}, category: ${props.category}`)
        paginateViewModel.load(false)

        if (onMount != null) onMount()

        const scrollLoader = new ScrollLoader(() => {
            paginateViewModel.loadMore(false)
        })
        const scrollListener = () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        }
        window.addEventListener("scroll", scrollListener)

        return () => {
            consoleDebug("IndexGridPosts useEffect cleanup")
            window.removeEventListener("scroll", scrollListener)
        }
    }, [])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [state.posts])

    const breakPointColumnsObj = useMemo(() => {
        return {
            default: 2,
            600: 1
        }
    }, [])

    const showPosts = useMemo(() => {
        if (state.posts.length == 0) {
            return props.loadedPosts
        }
        return state.posts
    }, [state.posts])

    return (
        <ul className="grid-index-ul">
            <Masonry
                breakpointCols={breakPointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {props.pageDescriptionHtml != null && props.pageDescriptionHtml.length > 0 &&
                    <IndexDescriptionItem innerHtml={props.pageDescriptionHtml} />
                }
                {showPosts.map((item: Post, index: number) =>
                    // TODO: 有时候jekyll生成的path和paginate生成的path不一样，导致item重新加载，这种情况并不多
                    <IndexItem key={item.path}
                        index={index}
                        title={item.title}
                        author={item.author}
                        actor={item.actors}
                        date={item.date}
                        path={item.path}
                        description={item.description}
                        cover={item.indexCover != null && item.indexCover.length > 0 ? item.indexCover : item.cover}
                        coverAlt={item.coverAlt}
                        last={index == showPosts.length - 1} />
                )}
                {(state.loading || state.loadingHint != null) &&
                    <li className="grid-index-li">
                        <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} />
                    </li>
                }
            </Masonry>
        </ul>
    )
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
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    // 缓存最新的回调

    useEffect(() => {
        consoleObjDebug("IndexItem componentDidMount", props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card")
        setupCardRipple(cardE as HTMLElement)

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
    }, [props.path])

    function startImageAnimation(imgE: HTMLImageElement): ImageLoadAnimator {
        return new ImageLoadAnimator(imgE, -1, false,
            () => {
                // 仅在用户未滚动时的第一页执行动画，否则是不可见的无需动画
                return window.scrollY <= 0
            },
            () => {
                // 图片尺寸动画执行完成
                // coverLoadedCallback()
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
        consoleObjDebug("IndexDescriptionItem useEffect", rootE)
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
            consoleDebug("IndexDescriptionItem useEffect cleanup")
            if (cardE != null) {
                getInterSectionObserver().unobserve(cardE)
            }
        }
    }, [])

    return (
        <li ref={containerRef} className="grid-index-li grid-index-li--description">
            <section className="mdc-card grid-index-card card-fade-in" dangerouslySetInnerHTML={{ __html: props.innerHtml }}>
            </section>
            <hr className="grid-index-li-divider" />
        </li>
    )
}