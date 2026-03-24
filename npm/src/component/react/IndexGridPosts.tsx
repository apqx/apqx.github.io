// import "./GridIndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { LOADING_HINT_ERROR, LOADING_HINT_NO_RESULT, LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { onTagTriggerClick } from "../tag"
import { getInterSectionObserver, queryAnimatedElement } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { setupCardRipple } from "../card"
import type { Post } from "../base/paginate/bean/Post"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"
import { Masonry } from "./MasonryGe"
import { toggleElementClass } from "../../util/tools"

interface Props extends BasePaginateViewProps<Post> {
    pageDescriptionHtml: string
}

export function IndexGridPosts(props: Props) {
    const [refreshLayoutVersion, setRefreshLayoutVersion] = useState(0)

    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options), true)
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    useEffect(() => {
        consoleDebug(`IndexGridPosts useEffect, tag: ${props.tag}, category: ${props.category}`)
        paginateViewModel.load()

        if (props.onMount != null) props.onMount()

        return () => {
            consoleDebug("IndexGridPosts useEffect cleanup")
        }
    }, [])

    // useEffect(() => {
    //     // 手动通知 masonry 组件在数据变化时触发布局
    //     setRefreshLayoutVersion(v => v + 1)
    // }, [state.posts])

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

    const descriptionPost: Post = useMemo(() => {
        return {
            title: "",
            date: "",
            moreDate: "",
            path: "description",
            author: "",
            actors: [],
            mentions: [],
            location: "",
            description: "",
            cover: "",
            coverForIndex: "",
            coverAlt: "",
            // width, height
            coverSize: [],
            tags: [],
            category: "",
            pinned: false,
            featured: false
        }
    }, [props.pageDescriptionHtml])

    const showPosts = useMemo(() => {
        let posts = state.posts
        if (state.posts.length == 0) {
            posts = props.loadedPosts
        }
        consoleObjDebug("Show posts in index grid", posts)
        return [descriptionPost, ...posts]
    }, [state.posts, props.pageDescriptionHtml])

    return (
        <ul className="grid-index-ul">
            <Masonry
                items={showPosts}
                getItemKey={item => item.path}
                renderItem={(item, index) =>
                    item.path === "description" ? (
                        <IndexDescriptionItem innerHtml={props.pageDescriptionHtml} />
                    ) : (
                        <IndexItem key={item.path}
                            index={index}
                            title={item.title}
                            author={item.author}
                            actor={item.actors}
                            date={item.date}
                            path={item.path}
                            description={item.description}
                            cover={item.coverForIndex != null && item.coverForIndex.length > 0 ? item.coverForIndex : item.cover}
                            coverAlt={item.coverAlt}
                            coverSize={item.coverSize}
                            last={index == showPosts.length - 1}
                            coverLoadedCallback={undefined} />)
                }
                defaultColumns={2}
                breakpoints={[
                    { maxWidth: 880, columns: 2 },
                    { maxWidth: 600, columns: 1 },
                ]}
                measureItemOnMount={true}
                observeItemResize={true}
                layoutVersion={refreshLayoutVersion}
                columnGap={0}
                rowGap={0}
                // 若不设置初始预估尺寸为 0，可能出现首页顺序入场的顺序错乱
                estimatedItemHeight={0}
            />

            <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
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
    // width, height
    coverSize?: number[],
    last: boolean,
    coverLoadedCallback?: () => void,
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    // 缓存最新的回调

    useEffect(() => {
        consoleObjDebug("IndexItem useEffect", props)
        const rootE = containerRef.current as HTMLElement;
        const cardE = rootE.querySelector(".grid-index-card")
        setupCardRipple(cardE as HTMLElement)

        const animationE = queryAnimatedElement(rootE)
        if (animationE != null) {
            getInterSectionObserver().observe(animationE)
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
                if (animationE.classList.contains("slide-in")) {
                    toggleElementClass(animationE, "slide-in", false)
                    toggleElementClass(animationE, "slide-in-offset", true)
                } else if (animationE.classList.contains("slide-in-farer")) {
                    toggleElementClass(animationE, "slide-in-farer", false)
                    toggleElementClass(animationE, "slide-in-farer-offset", true)
                }
            }
        }
        window.addEventListener("scroll", scrollListener)

        return () => {
            consoleDebug("IndexItem useEffect cleanup " + props.title)
            if (animationE != null) {
                getInterSectionObserver().unobserve(animationE)
            }
            window.removeEventListener("scroll", scrollListener)
        }
    }, [])

    const actorStr = useMemo(() => props.actor.join(" "), [props.actor])

    const animationClass = useMemo(() => {
        if (window.scrollY > 0) {
            return " slide-in-farer-offset"
        }
        return " slide-in-farer slide-in-chained"
    }, [])

    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    const aspectRatio = useMemo(() => {
        if (props.coverSize != null && props.coverSize.length == 2) {
            return props.coverSize[0] / props.coverSize[1]
        }
        return undefined
    }, [props.coverSize])

    return (
        <li ref={containerRef} className="grid-index-li">
            <a
                className={"index-a mdc-card grid-index-card grid-index-card__ripple" + animationClass}
                data-animation-index={props.index}
                href={props.path}
            >
                <section>
                    {props.cover != null && props.cover.length > 0 &&
                        <img className="grid-index-cover"
                            style={aspectRatio ? { aspectRatio: aspectRatio } : {}}
                            loading="lazy" src={props.cover} alt={props.coverAlt} />}
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
        const animationE = queryAnimatedElement(rootE)
        if (animationE != null) {
            getInterSectionObserver().observe(animationE)
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
            if (animationE != null) {
                getInterSectionObserver().unobserve(animationE)
            }
        }
    }, [])

    return (
        <li ref={containerRef} className="grid-index-li grid-index-li--description">
            <section className="mdc-card grid-index-card slide-in-farer slide-in-chained" dangerouslySetInnerHTML={{ __html: props.innerHtml }}>
            </section>
            <hr className="grid-index-li-divider" />
        </li>
    )
}