// import "./IndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { LOADING_HINT_ERROR, LOADING_HINT_NO_RESULT, LoadingHint } from "./LoadingHint"
import { consoleInfo, consoleInfoObj } from "../../util/log"
import { getWindowInterSectionObserver, queryAnimatedElement } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { setupCardRipple } from "../card"
import type { Post } from "../base/paginate/bean/Post"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"
import { convertPinedToFeatured, toggleElementClass } from "../../util/tools"
import { getEventEmitter } from "../base/EventBus"
import { toggleDrawer } from "../drawer"

interface Props extends BasePaginateViewProps<Post> {
    pageCover?: string,
    pageCoverDescription?: string,
    pageTitle?: string,
}

export function IndexLinearPosts(props: Props) {
    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options), true)
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    useEffect(() => {
        consoleInfo(`IndexLinearPosts useEffect, tag: ${props.tag}, category: ${props.category}`)
        paginateViewModel.load()

        if (props.onMount != null) props.onMount()

        return () => {
            consoleInfo("IndexLinearPosts useEffect cleanup")
        }
    }, [])

    // 加载状态变化时，通知 Footer 显示或隐藏
    // 加载时隐藏，有结果时（错误或加载完成）显示
    useEffect(() => {
        if (state.loading) {
            getEventEmitter().emit("footerDisplayChange", { enabled: false })
        } else {
            getEventEmitter().emit("footerDisplayChange", { enabled: true })
        }

    }, [state.loading])

    const onLoadMore = useCallback(() => {
        if (state.loadingHint != LOADING_HINT_ERROR && state.loadingHint != LOADING_HINT_NO_RESULT) {
            paginateViewModel.loadMore()
        }
    }, [state.loadingHint])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [state.posts])

    const showPosts = useMemo(() => {
        let posts = state.posts
        if (state.posts.length == 0) {
            return posts
        }
        // 把 pinned 项目放在前面
        return props.pinnedPosts.concat(convertPinedToFeatured(props.pinnedPosts.length, posts))
    }, [state.posts])

    return (
        <>
            {
                props.pageCover != null && showPosts.length > 0 &&
                <PageCover pageCover={props.pageCover} pageCoverDescription={props.pageCoverDescription ?? ""} pageTitle={props.pageTitle ?? ""} />
            }
            <ul className="index-ul">
                {showPosts.map((item, index) =>
                    <IndexItem key={item.path + "?pinned=" + item.pinned}
                        title={item.title} author={item.author} date={item.date} description={item.description} path={item.path}
                        pinned={item.pinned} featured={item.featured} last={index === showPosts.length - 1} index={index} />
                )}
                <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore}
                    hide={showPosts.length == 0 && state.loading} />
            </ul>
        </>
    )
}

type PageCoverProps = {
    pageCover: string,
    pageCoverDescription: string,
    pageTitle: string,
}

function PageCover(props: PageCoverProps) {
    const containerRef = useRef<HTMLElement>(null)

    const onCardClick = useCallback(() => {
        toggleDrawer(true)
    }, [])

    useEffect(() => {
        const topCardE = containerRef.current as HTMLElement
        getWindowInterSectionObserver().observe(topCardE)
        setupCardRipple(topCardE)
        topCardE.addEventListener("click", onCardClick)

        return () => {
            getWindowInterSectionObserver().unobserve(topCardE)
            topCardE.removeEventListener("click", onCardClick)
        }
    }, [])

    return (
        <section ref={containerRef} className="mdc-card index-top-card slide-in-farer slide-in-chained">
            <img src={props.pageCover}
                className="index-top-cover" alt={props.pageCoverDescription} id="main-index" draggable="false" />
            <div className="index-top-card-container">
                <p className="index-top-card-text font-handwritten">{props.pageTitle}</p>
            </div>
        </section>
    )
}

type IndexItemProps = {
    title: string,
    author: string,
    date: string,
    description: string,
    path: string,
    pinned: boolean,
    featured: boolean,
    last: boolean,
    index: number
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    useEffect(() => {
        consoleInfoObj("IndexItem useEffect " + props.index + " : " + props.title, props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".index-card") as HTMLElement
        setupCardRipple(cardE)

        const animationE = queryAnimatedElement(rootE)
        if (animationE != null) {
            getWindowInterSectionObserver().observe(animationE)
        }

        const scrollListener = () => {
            if (animationE != null) {
                // 对于首批设置为 slide-in 的元素，滚动时检查，若动画尚未启动，改为 slide-in-offset
                // 因为检测区域变了，所以不能在 intersection observer 里处理
                if (window.scrollY <= 0) return
                if (animationE.classList.contains("slide-in--start")) {
                    window.removeEventListener("scroll", scrollListener)
                    return
                }
                toggleElementClass(animationE, "slide-in-chained", false)
                if (animationE.classList.contains("slide-in-farer")) {
                    toggleElementClass(animationE, "slide-in-farer", false)
                    toggleElementClass(animationE, "slide-in-offset", true)
                } else if (animationE.classList.contains("slide-in")) {
                    toggleElementClass(animationE, "slide-in", false)
                    toggleElementClass(animationE, "slide-in-offset", true)
                }
            }
        }
        window.addEventListener("scroll", scrollListener)

        return () => {
            consoleInfo("IndexItem useEffect cleanup " + props.title)
            if (animationE != null) {
                getWindowInterSectionObserver().unobserve(animationE)
            }
            window.removeEventListener("scroll", scrollListener)
        }
    }, [])

    const animationClass = useMemo(() => {
        if (window.scrollY > 0) {
            return " slide-in-offset"
        }
        return " slide-in-farer slide-in-chained"
    }, [])

    return (
        <li ref={containerRef} className="index-li">
            <a className={"index-a mdc-card index-card" + animationClass} href={props.path}>
                <section>
                    <h1 className="index-title">{props.title}</h1>
                    <span className="index-author">{props.author}</span>
                    <span className="index-date">
                        {date.year}<span className="year">年</span>
                        {date.month}<span className="month">月</span>
                        {date.day}<span className="day">日</span>
                    </span>
                    {props.pinned &&
                        <span className="index-pinned-icon-container"><i className="material-symbols-rounded-variable">keep</i></span>
                    }
                    {!props.pinned && props.featured &&
                        <span className="index-featured-icon-container"><i className="material-symbols-rounded-variable">editor_choice</i></span>
                    }
                </section>
            </a>
            {!props.last && <hr className="index-li-divider" />}
        </li>
    )
}
