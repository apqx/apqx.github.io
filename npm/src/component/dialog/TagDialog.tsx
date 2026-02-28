import "./TagDialog.scss"
import { MDCList } from "@material/list"
import { BaseDialog, TAG_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { consoleDebug } from "../../util/log"
import { setupListItemRipple } from "../list"
import { LoadingHint } from "../react/LoadingHint"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL } from "../../base/constant"
import type { SectionType } from "../../base/constant"
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { getSplittedDate } from "../../base/post"
import { SmoothCollapse } from "../animation/SmoothCollapse"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import type { Post } from "../base/paginate/bean/Post"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"

interface TagDialogProps extends BaseDialogOpenProps {
    tag: string,
    nickname?: string,
}

function TagDialog(props: TagDialogProps) {
    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: "",
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options))
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    useEffect(() => {
        paginateViewModel.load(true)
    }, [])

    const onDialogOpen = useCallback(() => {
        if (state.posts.length == 0) {
            paginateViewModel.load(true)
        }
    }, [state.posts])

    const onDialogClose = useCallback(() => {
        paginateViewModel.abort()
    }, [])

    const onLoadMore = useCallback(() => {
        paginateViewModel.loadMore()
    }, [])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [state.posts])

    return (
        <BaseDialog openCount={props.openCount} fixedWidth={true} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose}>
            <SmoothCollapse>
                <p>标记 {props.nickname ?? props.tag} 的 {state.totalPostsSize} 篇博文</p>
                {state.posts != null && state.posts.length != 0 &&
                    <PostResult list={state.posts} />
                }
                <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
            </SmoothCollapse>
        </BaseDialog>
    )
}

interface PostResultProps {
    list: Post[]
}

function PostResult(props: PostResultProps) {
    const containerRef = useRef<HTMLUListElement>(null)
    const items = useMemo(() => {
        return props.list.map((item) => {
            const postType = getSectionTypeByPath(item.path)
            const postBlocks = getPostBlocks(item.author, item.actors, item.mentions, item.location, postType)
            // 两个 chip 列表
            return { url: item.path, title: item.title, date: item.date, type: postType.name, block1Array: postBlocks[0], block2Array: postBlocks[1] }
        })
    }, [props.list])

    useEffect(() => {
        const rootE = containerRef.current as Element
        new MDCList(rootE)
    }, [])

    return (
        <ul ref={containerRef} className="mdc-deprecated-list">
            {items.map((item, index) =>
                <PostItem
                    key={item.title + item.date}
                    data={item}
                />
            )}
        </ul>
    )
}

/**
 * 获取一个文章要显示的块，包括 author 作者、actor 演员、mention 提到
 * 显示，一共就2个block，用不同的颜色区分
 * @param author 作者
 * @param actors 演员
 * @param mentions 提到
 * @param location 地点
 * @param postType 文章类型
 * @returns [block1, block2]
 */
function getPostBlocks(author: string, actors: Array<string>, mentions: Array<string>, location: string, postType: SectionType): [string[], string[]] {
    if (postType.identifier === SECTION_TYPE_ORIGINAL.identifier) {
        // 随笔，不显示 author，显示 actor、mention、location
        if (location.length > 0) {
            return [actors, mentions.concat(location)]
        } else {
            return [actors, mentions]
        }
    } else if (postType.identifier === SECTION_TYPE_OPERA.identifier) {
        // 看剧，显示 actor、mention、location
        if (location.length > 0) {
            return [actors, mentions.concat(location)]
        } else {
            return [actors, mentions]
        }
    } else {
        // 其它类型，显示 author、mention
        return [[author], mentions]
    }
}

interface PostItemData {
    url: string
    title: string
    date: string
    type: string
    block1Array: string[]
    block2Array: string[]
}

interface PostItemProps {
    data: PostItemData
}

function PostItem(props: PostItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    const date = useMemo(() => {
        return getSplittedDate(props.data.date)
    }, [props.data.date])

    useEffect(() => {
        const rootE = containerRef.current as Element
        const liE = rootE.querySelector(".mdc-deprecated-list-item") as HTMLElement
        setupListItemRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            {/* 禁止列表自动获取焦点，可能导致 dialog 关闭时意外滚动到焦点位置 */}
            <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken tag-list-item mdc-ripple-upgraded" href={props.data.url} tabIndex={-1}>
                <span className="mdc-deprecated-list-item__text">
                    <span className="list-item__primary-text one-line">{props.data.title}</span>
                    <div className="list-item__secondary-text tag-list-item__secondary-container">
                        <span className="tag-list-item__block-container">
                            <span className="tag-list-item__post-type">
                                {date.year}<span className="year">年</span>
                                {date.month}<span className="month">月</span>
                                {date.day}<span className="day">日</span>
                                ｜{props.data.type}</span>
                            {props.data.block1Array.map((value, index) =>
                                <Block key={value} type={1} title={value} />
                            )}
                            {props.data.block2Array.map((value, index) =>
                                <Block key={value} type={2} title={value} />
                            )}
                        </span>
                    </div>
                </span>
            </a>
            <hr className="mdc-deprecated-list-divider" />
        </li>
    )
}

interface BlockProps {
    type: number,
    title: string,
}

function Block(props: BlockProps) {
    const { type, title } = props
    const classes = useMemo(() => {
        const classes: string[] = []
        if (type === 1) {
            classes.push("tag-list-item__post-block1")
        } else if (type === 2) {
            classes.push("tag-list-item__post-block2")
        }
        return classes
    }, [type])

    return (
        <span className={classes.join(" ")}>{title}</span>
    )
}

let openCount = 0
// nickname 是 tag 的别名，如果存在则在 dialog 标题显示别名，否则显示 tag 原文
export function showTagDialog(_tag: string, _tagNickname?: string) {
    consoleDebug("ShowTagDialog " + _tag)
    showDialog(<TagDialog openCount={openCount++} tag={_tag} nickname={_tagNickname} />, TAG_DIALOG_WRAPPER_ID + "-" + _tag)
    // OnClickBtn={null} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID)
}
