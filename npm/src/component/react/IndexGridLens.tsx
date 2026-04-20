// import "./LensIndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { LOADING_HINT_ERROR, LOADING_HINT_NO_RESULT, LoadingHint } from "./LoadingHint"
import { consoleInfo, consoleInfoObj } from "../../util/log"
import { getWindowInterSectionObserver, queryAnimatedElement } from "../animation/BaseAnimation"
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
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter } from "../base/EventBus"
import { convertPinedToFeatured } from "../../util/tools"
import { Masonry } from "./MasonryGe"
import { LENS_FILTER_SORT_ASC } from "../dialog/LensFilterDialogViewModel"
import { getLocalRepository } from "../../repository/LocalDb"
import { scrollToTopNative } from "../fab"

export function IndexGridLens(props: BasePaginateViewProps<Post>) {
    const masonryContainerRef = useRef<HTMLUListElement>(null)
    const [filterTags, setFilterTags] = useState<Array<string>>([])
    const [lensBiggerPicture, setLensBiggerPicture] = useState(() => {
        return getLocalRepository().getLensBiggerPicture()
    })
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
        consoleInfo(`IndexGridLens useEffect, tag: ${props.tag}, category: ${props.category}, filterTags: ${filterTags.toString()} `)
        if (props.onMount != null)
            props.onMount()

        const emitter = getEventEmitter()
        emitter.on("lensFilterChange", (data) => {
            consoleInfo("IndexGridLens receive lensFilterChange event, selectedTags = " + data.selectedTags.toString())
            setFilterTags(data.selectedTags)
        })
        emitter.on("lensBiggerPictureChange", (data) => {
            consoleInfo("IndexGridLens receive lensBiggerPictureChange event, enabled = " + data.enabled)
            setLensBiggerPicture(data.enabled)
        })
        // 监听从缓存中恢复设置的事件，更新单列显示设置
        emitter.on("pageEvent", (data) => {
            if (data == EVENT_PAGE_BACK_FROM_CACHE) {
                const enabled = getLocalRepository().getLensBiggerPicture()
                consoleInfo("IndexGridLens receive restoreSettingsFromCache event, restore lensBiggerPicture to " + enabled)
                setLensBiggerPicture(enabled)
            }
        })

        return () => {
            consoleInfo("IndexGridLens useEffect cleanup")
            emitter.off("lensFilterChange")
            emitter.off("lensBiggerPictureChange")
            emitter.off("pageEvent")
        }
    }, [])

    // useEffect(() => {
    //     consoleDebug("IndexGridLens httpState or pagefindState changed, trigger layout")
    //     // 手动通知 masonry 组件在数据变化时触发布局
    //     setRefreshLayoutVersion(prev => prev + 1)
    // }, [httpState.posts, pagefindState.posts])

    const pagefindOptions = useMemo(() => {
        const sort = filterTags.includes(LENS_FILTER_SORT_ASC) ? "asc" : "desc"
        const filteredTags = filterTags.filter(tag => tag != LENS_FILTER_SORT_ASC)
        return {
            filters: {
                category: { any: ["lens"] },
                tag: [...filteredTags],
            },
            sort: {
                "precise-date": sort
            }
        }
    }, [filterTags])

    // 初始化加载数据
    useEffect(() => {
        scrollToTopNative(false)
        // 筛选标签变化时，清除旧数据并加载新数据
        if (filterTags.length > 0) {
            pagefindPaginateViewModel.clear()
            pagefindPaginateViewModel.search(null, pagefindOptions)
        } else {
            httpPaginateViewModel.clear()
            httpPaginateViewModel.load()
        }

    }, [filterTags])

    // 加载状态变化时，通知 Footer 显示或隐藏
    // 加载时隐藏，有结果时（错误或加载完成）显示
    useEffect(() => {
        if (filterTags.length > 0) {
            if (pagefindState.loading) {
                getEventEmitter().emit("footerDisplayChange", { enabled: false })
            } else {
                getEventEmitter().emit("footerDisplayChange", { enabled: true })
            }
        } else {
            if (httpState.loading) {
                getEventEmitter().emit("footerDisplayChange", { enabled: false })
            } else {
                getEventEmitter().emit("footerDisplayChange", { enabled: true })
            }
        }
    }, [filterTags, httpState.loading, pagefindState.loading])

    const onLoadMore = useCallback(() => {
        if (filterTags.length > 0 && pagefindState.loadingHint != LOADING_HINT_ERROR && pagefindState.loadingHint != LOADING_HINT_NO_RESULT) {
            pagefindPaginateViewModel.loadMore()
        } else if (filterTags.length == 0 && httpState.loadingHint != LOADING_HINT_ERROR && httpState.loadingHint != LOADING_HINT_NO_RESULT) {
            httpPaginateViewModel.loadMore()
        }
    }, [filterTags, httpState.loadingHint, pagefindState.loadingHint])

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

    const breakpoints = useMemo(() => {
        // TODO: 布局变化时是否需要清除数据重新加载？
        if (lensBiggerPicture) {
            return [
                { maxWidth: 1400, columns: 3 },
                { maxWidth: 880, columns: 2 },
                { maxWidth: 600, columns: 1 }
            ]
        } else {
            return [
                { maxWidth: 1400, columns: 3 },
                { maxWidth: 600, columns: 2 },
                { maxWidth: 300, columns: 1 },
            ]
        }
    }, [lensBiggerPicture])

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
                        coverLoadedCallback={undefined} />
                )}
                defaultColumns={3}
                breakpoints={breakpoints}
                measureItemOnMount={true}
                observeItemResize={true}
                layoutVersion={refreshLayoutVersion}
                columnGap={0}
                rowGap={0}
                // 若不设置初始预估尺寸为 0，可能出现首页顺序入场的顺序错乱
                estimatedItemHeight={0}
            />
            <LoadingHint loading={loadingState.loading} loadHint={loadingState.loadingHint} onClickHint={onClickHint}
                onLoadMore={onLoadMore} extendIntersectionThreshold={true} />
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
    coverLoadedCallback?: () => void
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleInfoObj("IndexItem useEffect " + props.index + " : " + props.title, props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card") as HTMLElement
        setupCardRipple(cardE)
        const coverE = rootE.querySelector(".grid-index-cover") as HTMLImageElement
        if (coverE.complete) {
            cardE.classList.add("image-loaded")
        } else {
            coverE.onload = () => {
                cardE.classList.add("image-loaded")
            }
        }


        const animationE = queryAnimatedElement(rootE)
        if (animationE != null) {
            // 元素进入 viewport 时检查距离上一个动画的时间差，如果很近则链式触发动画
            getWindowInterSectionObserver().observe(animationE)
        }

        return () => {
            consoleInfo("IndexItem useEffect cleanup " + props.index + " : " + props.title)
            coverE.onload = null
            if (animationE != null) {
                getWindowInterSectionObserver().unobserve(animationE)
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
