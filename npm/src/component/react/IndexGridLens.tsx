// import "./LensIndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { getInterSectionObserver, queryAnimatedElement } from "../animation/BaseAnimation"
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
import { convertPinedToFeatured, toggleElementClass } from "../../util/tools"
import { Masonry } from "./MasonryGe"

export function IndexGridLens(props: BasePaginateViewProps<Post>) {
    const masonryContainerRef = useRef<HTMLUListElement>(null)
    const [filterTags, setFilterTags] = useState<Array<string>>([])
    const [refreshLayoutVersion, setRefreshLayoutVersion] = useState(0)
    const [observeItemResize, setObserveItemResize] = useState(false)

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
        if (props.onMount != null)
            props.onMount()

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

    useEffect(() => {
        consoleDebug("IndexGridLens httpState or pagefindState changed, trigger layout")
        // 必须通知 masonry 组件在数据变化时触发布局
        setRefreshLayoutVersion(prev => prev + 1)
    }, [httpState.posts, pagefindState.posts])

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

    // 初始化加载数据
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

    const onLoadMore = useCallback(() => {
        if (filterTags.length > 0) {
            pagefindPaginateViewModel.loadMore()
        } else {
            httpPaginateViewModel.loadMore()
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

    const showPosts = useMemo(() => {
        if (filterTags.length > 0) {
            return pagefindState.posts
        } else {
            let posts = props.loadedPosts
            if (httpState.posts.length > 0) {
                posts = httpState.posts
            }
            // 把 pinned 项目放在前面
            return props.pinnedPosts.concat(convertPinedToFeatured(props.pinnedPosts.length, posts))
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

    const onAnimationComplete = useCallback(() => {
        // 图片加载动画完成后，开启元素尺寸变化监听，适配用户在页面初次加载后滚动时才加载的图片
        setRefreshLayoutVersion(prev => prev + 1)
        setObserveItemResize(true)
    }, [])

    return (
        <ul ref={masonryContainerRef} className="grid-index-ul">
            <Masonry
                items={showPosts}
                getItemKey={item => item.path}
                renderItem={(item, index) => (
                    <IndexItem key={item.path}
                        index={index}
                        title={item.title}
                        actors={item.actors}
                        date={item.date}
                        path={item.path}
                        cover={item.cover}
                        coverSize={item.coverSize}
                        last={index == showPosts.length - 1}
                        pinned={item.pinned}
                        featured={item.featured}
                        coverLoadedCallback={onAnimationComplete} />
                )}
                defaultColumns={3}
                breakpoints={[
                    { maxWidth: 1400, columns: 3 },
                    { maxWidth: 600, columns: 2 },
                    { maxWidth: 300, columns: 1 },
                ]}
                measureItemOnMount={true}
                observeItemResize={true}
                layoutVersion={refreshLayoutVersion}
                columnGap={0}
                rowGap={0}
                estimatedItemHeight={0}
            />
            <LoadingHint loading={loadingState.loading} loadHint={loadingState.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
        </ul>
    )
}

type IndexItemProps = {
    // 在一些 masonry 布局中，这个 index 可能不是原数据列表中的 index
    index: number,
    title: string,
    actors: Array<string>,
    date: string,
    path: string,
    cover: string,
    // width, height
    coverSize?: number[],
    last: boolean,
    pinned: boolean,
    featured: boolean,
    coverLoadedCallback: () => void
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleObjDebug("IndexItem useEffect " + props.index + " : " + props.title, props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card") as HTMLElement
        setupCardRipple(cardE)
        const animationE = queryAnimatedElement(rootE)
        if (animationE != null) {
            // 元素进入 viewport 时检查距离上一个动画的时间差，如果很近则链式触发动画
            getInterSectionObserver().observe(animationE)
        }

        return () => {
            consoleDebug("IndexItem useEffect cleanup " + props.index + " : " + props.title)
            if (animationE != null) {
                getInterSectionObserver().unobserve(animationE)
            }
        }
    }, [])

    /**
     * 默认是滑入动画，检测区域为元素原始位置，如果用户滚动改为淡入动画
     * scroll-to-fade-in 的作用是对于首批设置为 slide-in 的元素，进入 intersection 时检查是否已经滚动过，是则改为 fade-in
     */
    const animationClass = useMemo(() => {
        if (window.scrollY > 0) {
            return " fade-in"
        }
        return " slide-in-farer slide-in-chained scroll-to-fade-in"
    }, [])

    const actorStr = useMemo(() => props.actors.join(" "), [props.actors])

    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    const aspectRatio = useMemo(() => {
        if (props.coverSize != null && props.coverSize.length == 2) {
            return props.coverSize[0] / props.coverSize[1]
        }
        return undefined
    }, [props.coverSize])

    return (
        <li ref={containerRef} className="grid-index-li">
            {/* 第一个元素使用 fade-in 动画，避免在小尺寸手机上因为 slide 距离在页面初次加载时不触发动画 */}
            {/* 用户滚动之前进入 viewport 的全部使用 slide-in 动画 */}
            <a
                className={"index-a mdc-card grid-index-card grid-index-card__ripple" + animationClass}
                data-animation-index={props.index}
                href={props.path}
            >
                <section className="lens-index-container">
                    <img className="grid-index-cover"
                        style={aspectRatio ? { aspectRatio: aspectRatio } : {}}
                        loading="lazy" src={props.cover} alt={actorStr} />
                    {props.pinned &&
                        <span className="lens-index-pinned-icon-container"><i className="material-symbols-rounded-variable">keep</i></span>
                    }
                    {!props.pinned && props.featured &&
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
