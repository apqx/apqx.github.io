import "./TagDialog.scss"
import { BaseDialog, TAG_DIALOG_WRAPPER_ID, getDialogController, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { consoleInfo } from "../../util/log"
import { LOADING_HINT_ERROR, LOADING_HINT_NO_RESULT, LoadingHint } from "../react/LoadingHint"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL } from "../../base/constant"
import type { SectionType } from "../../base/constant"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { getSplittedDate } from "../../base/post"
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel"
import type { ApiPost } from "../../repository/bean/service/ApiPost"
import type { Post } from "../base/paginate/bean/Post"
import { PostHttpPaginator } from "../base/paginate/PostHttpPaginator"
import { setupRipple } from "../ripple"

interface TagDialogProps extends BaseDialogOpenProps {
    tag: string,
    nickname?: string,
}

function TagDialog(props: TagDialogProps) {
    const [triggerIntersection, setTriggerIntersection] = useState(0)

    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: "",
        }
        return new HttpPaginatorViewModel<ApiPost, PostHttpPaginator, Post>(new PostHttpPaginator(options), true)
    }, [props.tag])

    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    useEffect(() => {
        paginateViewModel.load(true)
    }, [paginateViewModel])

    const onDialogOpen = useCallback(() => {
        if (state.posts.length == 0) {
            paginateViewModel.load(true)
        } else {
            setTriggerIntersection(prev => prev + 1)
        }
    }, [state.posts, paginateViewModel])

    const onDialogClose = useCallback(() => {
        paginateViewModel.abort()
    }, [paginateViewModel])

    const onLoadMore = useCallback(() => {
        if (!props.dialogControllerRef?.current?.opened) {
            return
        }
        if (state.loadingHint != LOADING_HINT_ERROR && state.loadingHint != LOADING_HINT_NO_RESULT) {
            paginateViewModel.loadMore()
        }
    }, [state.loadingHint, paginateViewModel, props.dialogControllerRef])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [state.posts, paginateViewModel])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef} fixedWidth={true} onDialogOpen={onDialogOpen}
            onDialogClose={onDialogClose} >
            <p>标记 {props.nickname ?? props.tag} 的 {state.totalPostsSize} 篇博文</p>
            {state.posts != null && state.posts.length != 0 &&
                <PostResult list={state.posts} />
            }
            <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore}
                triggerIntersectionCheckCount={triggerIntersection} />
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

    return (
        <ul ref={containerRef} className="mdm-list">
            {items.map((item, _index) =>
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
        const liE = rootE.querySelector(".mdm-list-item") as HTMLElement
        setupRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            {/* 禁止列表自动获取焦点，可能导致 dialog 关闭时意外滚动到焦点位置 */}
            <a className="mdm-list-item mdm-list-item-darken tag-list-item" href={props.data.url} tabIndex={-1}>
                <div className="mdm-list-item__text">
                    <div className="mdm-list-item__primary-text">{props.data.title}</div>
                    <div className="mdm-list-item__secondary-text tag-list-item__secondary-container">
                        <div className="tag-list-item__block-container">
                            <span className="tag-list-item__post-type">
                                {date.year}<span className="year">年</span>
                                {date.month}<span className="month">月</span>
                                {date.day}<span className="day">日</span>
                                ｜{props.data.type}</span>
                            {props.data.block1Array.map((value, _index) =>
                                <Block key={value} type={1} title={value} />
                            )}
                            {props.data.block2Array.map((value, _index) =>
                                <Block key={value} type={2} title={value} />
                            )}
                        </div>
                    </div>
                </div>
            </a>
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

// nickname 是 tag 的别名，如果存在则在 dialog 标题显示别名，否则显示 tag 原文
export function showTagDialog(_tag: string, _tagNickname?: string) {
    consoleInfo("ShowTagDialog " + _tag)
    const id = TAG_DIALOG_WRAPPER_ID + "-" + _tag
    const dialogControllerRef = getDialogController(id)
    showDialog(<TagDialog dialogControllerRef={dialogControllerRef} tag={_tag} nickname={_tagNickname} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}
