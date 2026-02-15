// import "./IndexList.scss"
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { LoadingHint } from "./LoadingHint"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { ScrollLoader } from "../../base/ScrollLoader"
import { getInterSectionObserver } from "../animation/BaseAnimation"
import { getSplittedDate } from "../../base/post"
import { setupCardRipple } from "../card"
import type { Post } from "../base/paginate/bean/Post"
import { HttpPaginatorViewModel as HttpPaginateViewModel } from "../base/paginate/HttpPaginateViewModel"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps"

export function IndexLinearPosts(props: BasePaginateViewProps<Post>) {
    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginateViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options))
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    const onMount = useMemo(() => props.onMount, [props.onMount])

    useEffect(() => {
        consoleDebug(`IndexLinearPosts useEffect, tag: ${props.tag}, category: ${props.category}`)
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
            consoleDebug("IndexLinearPosts useEffect cleanup")
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

    const showPosts = useMemo(() => {
        if (state.posts.length == 0) {
            return props.loadedPosts
        }
        return state.posts
    }, [state.posts])

    return (
        <ul className="index-ul">
            {/* 置顶 */}
            {props.pinnedPosts.map((post) =>
                <IndexItem key={post.title + post.date}
                    title={post.title} author={post.author} date={post.date} description={post.description} path={post.path}
                    fromPinnedList={true} pinned={true} featured={post.featured} />
            )}
            {/* 普通 */}
            {showPosts.map((item, index) =>
                // 有时候 jekyll 生成的 path 和 paginate 生成的 path 不一样，导致 item 重新加载
                <IndexItem key={item.path}
                    title={item.title} author={item.author} date={item.date} description={item.description} path={item.path}
                    fromPinnedList={false} pinned={item.pinned} featured={item.featured} />
            )}
            {(state.loading || state.loadingHint != null) &&
                <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} />
            }
        </ul>
    )
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
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    const cardE = useRef<HTMLElement>(null)
    const date = useMemo(() => getSplittedDate(props.date), [props.date]);

    useEffect(() => {
        consoleObjDebug("IndexItem component mounted", props)
        const rootE = containerRef.current as HTMLElement;
        cardE.current = rootE.querySelector(".index-card") as HTMLElement

        setupCardRipple(cardE.current)
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
            <a className={`index-a mdc-card index-card card-slide-in`} href={props.path}>
                <section>
                    <h1 className="index-title">{props.title}</h1>
                    <span className="index-author">{props.author}</span>
                    <span className="index-date">
                        {date.year}<span className="year">年</span>
                        {date.month}<span className="month">月</span>
                        {date.day}<span className="day">日</span>
                    </span>
                    {props.fromPinnedList &&
                        <span className="index-pinned-icon-container"><i className="material-symbols-rounded-variable">keep</i></span>
                    }
                    {!props.fromPinnedList && (props.pinned || props.featured) &&
                        <span className="index-featured-icon-container"><i className="material-symbols-rounded-variable">editor_choice</i></span>
                    }
                </section>
            </a>
            <hr className="index-li-divider" />
        </li>
    )
}
