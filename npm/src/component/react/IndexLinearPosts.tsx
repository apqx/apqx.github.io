// import "./IndexList.scss"
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
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"
import { emptyString, toggleElementClass } from "../../util/tools"
import { getEventEmitter, type Events } from "../base/EventBus"
import { toggleDrawer } from "./Drawer"
import { getSectionTypeByPath, SECTION_TYPE_ORIGINAL } from "../../base/constant"
import { IndexLinearCoverViewModel } from "./IndexLinearCoverViewModel"
import type { ApiCover } from "../../repository/bean/service/ApiCover"

export function IndexLinearPosts(props: BasePaginateViewProps) {
    const haveSearchedOrInteractedRef = useRef(false)

    const coverLoadViewModel = useMemo(() => {
        return new IndexLinearCoverViewModel(props.category)
    }, [props.category])
    const coverState = useSyncExternalStore(coverLoadViewModel.subscribe, () => coverLoadViewModel.state)

    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
            loadPinned: true
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options), true)
    }, [props.tag, props.category])
    const postState = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)


    useEffect(() => {
        consoleInfo(`IndexLinearPosts useEffect, tag: ${props.tag}, category: ${props.category}`)
        coverLoadViewModel.load()
        paginateViewModel.load()

        return () => {
            consoleInfo("IndexLinearPosts useEffect cleanup")
        }
    }, [props.tag, props.category, paginateViewModel, coverLoadViewModel])

    // 加载状态变化时，通知 Footer 显示或隐藏
    // 加载时隐藏，有结果时（错误或加载完成）显示
    useEffect(() => {
        if (postState.loading || coverState.loading) {
            getEventEmitter().emit("applyFooterDisplayChange", { enabled: false })
        } else {
            getEventEmitter().emit("applyFooterDisplayChange", { enabled: true })
        }

    }, [postState.loading, coverState.loading])

    const onLoadMore = useCallback(() => {
        if (coverState.loadingHint != LOADING_HINT_ERROR && postState.loadingHint != LOADING_HINT_ERROR && postState.loadingHint != LOADING_HINT_NO_RESULT) {
            paginateViewModel.loadMore()
        }
    }, [coverState.loadingHint, postState.loadingHint, paginateViewModel])

    const onClickHint = useCallback(() => {
        haveSearchedOrInteractedRef.current = true
        if (coverState.cover == null) {
            coverLoadViewModel.load()
        }
        if (postState.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [coverState.cover, postState.posts, paginateViewModel, coverLoadViewModel])

    const hideLoading = useMemo(() => {
        // 首页加载不显示 loading
        return !haveSearchedOrInteractedRef.current && postState.posts.length == 0 && postState.loading
    }, [postState.loading, postState.posts.length])

    const loadingHint = useMemo(() => {
        let loadHint = postState.loadingHint
        if (coverState.loadingHint) {
            loadHint = coverState.loadingHint
        }
        return loadHint
    }, [coverState.loadingHint, postState.loadingHint])

    return (
        <>
            {
                coverState.cover && coverState.cover.cover.length > 0 && postState.posts.length > 0 &&
                <PageCover cover={coverState.cover} />
            }
            {
                coverState.cover && coverState.cover.cover.length > 0 &&
                <ul className="index-ul">
                    {postState.posts.map((item, index) =>
                        <IndexItem key={item.path + "?pinned=" + item.pinned}
                            title={item.title} author={item.author} date={item.date} moreDate={item.moreDate} description={item.description} path={item.path}
                            pinned={item.pinned} featured={item.featured} last={index === postState.posts.length - 1} index={index} />
                    )}
                </ul>
            }
            <LoadingHint loading={postState.loading || coverState.loading} loadHint={loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore}
                hide={hideLoading} />
        </>
    )
}

type PageCoverProps = {
    cover: ApiCover
}

function PageCover(props: PageCoverProps) {
    const containerRef = useRef<HTMLElement>(null)
    const [themeChangedCount, setThemChangedCount] = useState(0)

    const onCardClick = useCallback(() => {
        toggleDrawer()
    }, [])

    useEffect(() => {
        consoleInfoObj(`PageCover useEffect mount, cover is`, props.cover)
        return () => {
            consoleInfo(`PageCover cleanup`)
        }
    }, [props.cover])

    useEffect(() => {
        const topCardE = containerRef.current as HTMLElement
        getWindowInterSectionObserver().observe(topCardE)
        setupCardRipple(topCardE)
        topCardE.addEventListener("click", onCardClick)

        const themeChangeHandler = (_data: Events["themeChanged"]) => {
            setThemChangedCount((prev) => prev + 1)
        }

        getEventEmitter().on("themeChanged", themeChangeHandler)

        return () => {
            getWindowInterSectionObserver().unobserve(topCardE)
            topCardE.removeEventListener("click", onCardClick)
            getEventEmitter().off("themeChanged", themeChangeHandler)
        }
    }, [onCardClick])

    const pageCover = useMemo(() => {
        void themeChangedCount
        let url = props.cover.cover
        let title = props.cover.coverTitle
        let description = props.cover.coverDescription
        const section = getSectionTypeByPath(window.location.pathname)
        const mainIndex = section.identifier == SECTION_TYPE_ORIGINAL.identifier
        if (document.body.classList.contains("expressive") && props.cover.expressive) {
            if (!emptyString(props.cover.expressive.cover)) {
                url = props.cover.expressive.cover
            }
            if (!emptyString(props.cover.expressive.coverTitle)) {
                title = props.cover.expressive.coverTitle
            }
            if (!emptyString(props.cover.expressive.coverDescription)) {
                description = props.cover.expressive.coverDescription
            }
        }
        return { url, title, description, mainIndex }
    }, [props.cover, themeChangedCount])

    return (
        <section ref={containerRef} className="mdm-card index-top-card slide-in-farer slide-in-chained">
            <div className="index-top-cover-wrapper">
                <img src={pageCover.url}
                    className="index-top-cover" alt={pageCover.description} id={pageCover.mainIndex ? "main-index" : ""} draggable="false" />
            </div>
            <div className="index-top-card-container">
                <p className="index-top-card-text font-handwritten">{pageCover.title}</p>
            </div>
        </section>
    )
}

type IndexItemProps = {
    title: string,
    author: string,
    date: string,
    moreDate: string,
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
        consoleInfo("IndexItem useEffect " + props.index + " : " + props.title)
        return () => {
            consoleInfo("IndexItem useEffect cleanup " + props.index + " : " + props.title)
        }
    }, [props.index, props.title])

    useEffect(() => {
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

    const author = useMemo(() => {
        if (props.moreDate != null && props.moreDate.trim() !== "") {
            return props.moreDate + " " + props.author
        }
        return props.author
    }, [props.author, props.moreDate])

    return (
        <li ref={containerRef} className="index-li">
            <a className={"index-a mdm-card index-card" + animationClass} href={props.path}>
                <section>
                    <h1 className="index-title">{props.title}</h1>
                    <span className="index-author">{author}</span>
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
