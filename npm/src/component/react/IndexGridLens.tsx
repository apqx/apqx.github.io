// import "./LensIndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { ImageLoadAnimator } from "../animation/ImageLoadAnimator"
import { LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { ScrollLoader } from "../../base/ScrollLoader"
import Masonry from 'react-masonry-css'
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { setupCardRipple } from "../card"
import type { Post } from "../base/paginate/bean/Post"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import { PagefindPaginateViewModel } from "../base/paginate/PagefindPaginateViewModel"
import type { PagefindResultItem } from "../../repository/bean/pagefind/ApiPagefindSearch"
import { PostPagefindPaginator } from "../base/paginate/PostPagefindPaginator"
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"
import { getEventEmitter } from "../base/EventBus"

export function IndexGridLens(props: BasePaginateViewProps<Post>) {
    const [filterTags, setFilterTags] = useState<Array<string>>([])

    const httpPaginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options))
    }, [])
    const pagefindPaginateViewModel = useMemo(() => {
        return new PagefindPaginateViewModel<PagefindResultItem, Post, PostPagefindPaginator>(new PostPagefindPaginator())
    }, [])

    const httpState = useSyncExternalStore(httpPaginateViewModel.subscribe, () => httpPaginateViewModel.state)
    const pagefindState = useSyncExternalStore(pagefindPaginateViewModel.subscribe, () => pagefindPaginateViewModel.state)


    useEffect(() => {
        consoleDebug(`IndexGridLens useEffect, tag: ${props.tag}, category: ${props.category}, filterTags: ${filterTags.toString()} `)
        if (props.onMount != null) props.onMount()

        const emitter = getEventEmitter()
        emitter.on("lensFilterChange", (data) => {
            consoleDebug("IndexGridLens receive lensFilterChange event, selectedTags = " + data.selectedTags.toString())
            setFilterTags(data.selectedTags)
        })

        return () => {
            consoleDebug("IndexGridLens useEffect cleanup")
            emitter.off("lensFilterChange")
        }
    }, [])

    // 监听滚动加载更多
    useEffect(() => {
        const scrollLoader = new ScrollLoader(() => {
            if (filterTags.length > 0) {
                pagefindPaginateViewModel.loadMore()
            } else {
                httpPaginateViewModel.loadMore()
            }
        })
        const scrollListener = () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        }
        window.addEventListener("scroll", scrollListener)

        return () => {
            window.removeEventListener("scroll", scrollListener)
        }
    }, [filterTags, httpState.posts, pagefindState.posts])

    const pagefindOptions = useMemo(() => {
        return {
            filters: {
                category: { any: ["lens"] },
                tag: [...filterTags],
            },
            sort: {
                "precise-date": "desc"
            }
        }
    }, [filterTags])

    // 初始化
    useEffect(() => {
        // 筛选标签变化时，清除旧数据并加载新数据
        if (filterTags.length > 0) {
            pagefindPaginateViewModel.clear()
            pagefindPaginateViewModel.search(null, pagefindOptions)
        } else {
            httpPaginateViewModel.clear()
            httpPaginateViewModel.load()
        }

    }, [filterTags])

    const onClickHint = useCallback(() => {
        if (filterTags.length > 0) {
            if (pagefindState.posts.length > 0) {
                pagefindPaginateViewModel.loadMore(true)
            } else {
                pagefindPaginateViewModel.search(null, pagefindOptions, true)
            }
        } else {
            if (httpState.posts.length > 0) {
                httpPaginateViewModel.loadMore(true)
            } else {
                httpPaginateViewModel.load(true)
            }
        }
    }, [httpState.posts, pagefindState.posts, filterTags])

    const breakPointColumnsObj = useMemo(() => {
        return {
            default: 3,
            600: 2,
            350: 1
        }
    }, [])

    const showPosts = useMemo(() => {
        if (filterTags.length > 0) {
            return pagefindState.posts
        } else {
            if (httpState.posts.length == 0) {
                return props.loadedPosts
            }
            return httpState.posts
        }
    }, [httpState.posts, pagefindState.posts, filterTags])

    const loadingState = useMemo(() => {
        if (filterTags.length > 0) {
            return {
                loading: pagefindState.loading,
                loadingHint: pagefindState.loadingHint
            }
        } else {
            return {
                loading: httpState.loading,
                loadingHint: httpState.loadingHint
            }
        }
    }, [httpState.loading, httpState.loadingHint, pagefindState.loading, pagefindState.loadingHint, filterTags])

    return (
        <ul className="grid-index-ul">
            <Masonry
                breakpointCols={breakPointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {/* 置顶，仅在非筛选模式下显示 */}
                {filterTags.length == 0 && props.pinnedPosts.map((item: Post, index: number) =>
                    <IndexItem key={item.path}
                        index={index}
                        title={item.title}
                        actors={item.actors}
                        date={item.date}
                        path={item.path}
                        cover={item.cover}
                        last={false}
                        fromPinnedList={true}
                        pinned={true}
                        featured={item.featured}
                        pinnedListSize={props.pinnedPosts.length}
                        coverLoadedCallback={() => { }} />)}
                {/* 普通 */}
                {showPosts.map((item: Post, index: number) =>
                    <IndexItem key={item.path}
                        index={index}
                        title={item.title}
                        actors={item.actors}
                        date={item.date}
                        path={item.path}
                        cover={item.cover}
                        last={index == showPosts.length - 1}
                        fromPinnedList={false}
                        pinned={item.pinned}
                        featured={item.featured}
                        pinnedListSize={props.pinnedPosts.length}
                        coverLoadedCallback={() => { }} />
                )}
            </Masonry>
            {(loadingState.loading || loadingState.loadingHint != null) &&
                <LoadingHint loading={loadingState.loading} loadHint={loadingState.loadingHint} onClickHint={onClickHint} />
            }
        </ul>
    )
}

type IndexItemProps = {
    index: number,
    title: string,
    actors: Array<string>,
    date: string,
    path: string,
    cover: string,
    last: boolean,
    fromPinnedList: boolean,
    pinned: boolean,
    featured: boolean,
    pinnedListSize: number
    coverLoadedCallback: () => void
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleObjDebug("IndexItem componentDidMount", props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card") as HTMLElement
        setupCardRipple(cardE)

        const imgE = rootE.querySelector(".grid-index-cover.image-height-animation")
        // 图片加载动画
        let imageLoadAnimator: ImageLoadAnimator | null = null
        if (imgE != null) {
            // 计算栏数，前两行图片依次执行动画
            // 3 栏为横屏大屏，前 2 行共 6 张图
            // 2 栏为竖屏小屏，前 3 行共 6 张图
            const parentWidth = rootE.parentElement?.parentElement?.clientWidth ?? 0
            const columnCount = parentWidth >= 950 ? 3 : 2
            consoleDebug("IndexItem parentWidth=" + parentWidth + " columnCount=" + columnCount)
            // if (props.index < columnCount * 2) {
            if (props.fromPinnedList && props.index < 6) {
                setTimeout(() => {
                    imageLoadAnimator = startImageAnimation(imgE as HTMLImageElement)
                }, 50 * props.index)
            } else if (!props.fromPinnedList && props.index + props.pinnedListSize < 6) {
                setTimeout(() => {
                    imageLoadAnimator = startImageAnimation(imgE as HTMLImageElement)
                }, 50 * (props.index + props.pinnedListSize))
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

    function startImageAnimation(imgE: HTMLImageElement): ImageLoadAnimator {
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

    const actorStr = useMemo(() => props.actors.join(" "), [props.actors])
    const animationClass = useMemo(() => props.index == 0 ? "card-fade-in" : "card-slide-in-middle", [props.index])

    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    return (
        <li ref={containerRef} className="grid-index-li">
            {/* 第一个元素使用 fade-in 动画，避免在小尺寸手机上因为 slide 距离在页面初次加载时不触发动画 */}
            <a className={"index-a mdc-card grid-index-card grid-index-card__ripple " + animationClass} href={props.path}>
                <section className="lens-index-container">
                    <img className="grid-index-cover image-height-animation" loading="lazy" src={props.cover} alt={actorStr} />
                    {props.fromPinnedList && props.pinned &&
                        <span className="lens-index-pinned-icon-container"><i className="material-symbols-rounded-variable">keep</i></span>
                    }
                    {!props.fromPinnedList && (props.pinned || props.featured) &&
                        <span className="lens-index-featured-icon-container"><i className="material-symbols-rounded-variable">editor_choice</i></span>
                    }
                    <div className="lens-index-text-container">
                        <span className="lens-index-date">
                            {date.year}{date.month}｜{actorStr}
                        </span>
                        {/* <span className="lens-index-date">{actorStr}</span> */}
                        {/* {
                            props.actors.length > 0 && props.actors.map((actor, index) =>
                                <span key={index} className="lens-index-date">{actor}</span>
                            )
                        } */}
                    </div>
                </section>
            </a>
            {!props.last && <hr className="grid-index-li-divider" />}
        </li>
    )
}
