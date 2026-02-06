import "./TagDialog.scss"
import { MDCList } from "@material/list"
import { BasicDialog, TAG_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import { setupListItemRipple } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import { BasePaginateShow } from "../react/post/BasePaginateShow"
import type { BasePaginateShowProps } from "../react/post/BasePaginateShow"
import type { IPaginateShowPresenter } from "../react/post/IPaginateShowPresenter"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL } from "../../base/constant"
import type { SectionType } from "../../base/constant"
import { DialogState, DialogStateObservable, DialogStateObserver } from "./DialogStateObservable"
import type { JSX } from "react"
import React, { useEffect, useState } from "react"
import { getSplittedDate } from "../../base/post"
import { PostPaginateShowPresenter, type Post } from "../react/post/PostPaginateShowPresenter"
import { SmoothCollapse } from "../animation/SmoothCollapse"

interface DialogContentProps extends BasicDialogProps {
    tag: string,
}

interface DialogContentState {
}

export class TagDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    dialogStateObservable: DialogStateObservable

    constructor(props: DialogContentProps) {
        super(props)
        consoleDebug("TagDialogContent constructor")
        this.fixedWidth = true
        this.onListSizeChanged = this.onListSizeChanged.bind(this)
        // this.scrollToTopOnDialogOpen = false
        this.listenScroll = true

        this.dialogStateObservable = new DialogStateObservable()
    }

    onDialogOpen(): void {
        this.dialogStateObservable.notify(DialogState.OPENED)
    }

    onDialogClose(): void {
        this.dialogStateObservable.notify(DialogState.CLOSED)
    }

    onScrollNearToBottom(): void {
        this.dialogStateObservable.notify(DialogState.LOAD_MORE)
    }

    onListSizeChanged() {
    }

    componentDidMount() {
        super.componentDidMount()
        consoleDebug("TagDialogContent componentDidMount")
    }

    componentWillUnmount(): void {
    }

    dialogContent(): JSX.Element {
        consoleDebug("TagDialogContent render")

        return (
            <SmoothCollapse>
                <ResultWrapper category={""} tag={this.props.tag} pinnedPosts={[]} loadedPosts={[]}
                    onUpdate={this.onListSizeChanged} dialogStateObservable={this.dialogStateObservable} />
            </SmoothCollapse>
        )
    }
}

interface ResultWrapperProps extends BasePaginateShowProps<Post> {
    dialogStateObservable: DialogStateObservable
}

class ResultWrapper extends BasePaginateShow<Post, ResultWrapperProps> {
    observer: DialogStateObserver = {
        update: (dialogState: DialogState) => {
            if (dialogState == DialogState.CLOSED) {
                // Dialog关闭时，取消加载
                this.abortLoad()
            } else if (dialogState == DialogState.OPENED) {
                // Dialog打开时，加载第一页
                if (this.state.posts.length == 0) {
                    this.loadFirstPage()
                }
            } else if (dialogState == DialogState.LOAD_MORE) {
                // Dialog加载更多
                if (!this.presenter.isLastPage() && this.state.loadHint != ERROR_HINT) {
                    // 不是最后一页，且没有错误提示，加载更多
                    this.loadMore()
                }
            }
        }
    }

    constructor(props: ResultWrapperProps) {
        super(props)
        this.loadFirstPageOnMount = false

        this.props.dialogStateObservable.addObserver(this.observer)
    }

    componentWillUnmount() {
        this.props.dialogStateObservable.removeObserver(this.observer)
    }

    createPresenter(): IPaginateShowPresenter {
        return new PostPaginateShowPresenter(this, true)
    }

    render(): React.ReactNode {
        let count: JSX.Element
        if (this.state.posts.length == 0) {
            count = <>0</>
        } else {
            count = <>{this.state.totalPostsSize}</>
        }
        return (
            <>
                <p>标记 {this.props.tag} 的 {count} 篇博文</p>
                {this.state.posts != null && this.state.posts.length != 0 &&
                    <PostResult list={this.state.posts} />
                }
                {(this.state.loading || this.state.loadHint != null) &&
                    <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                }
            </>
        )
    }
}


interface PostResultProps {
    list: Post[]
}

class PostResult extends React.Component<PostResultProps, any> {
    private containerRef: React.RefObject<HTMLUListElement | null> = React.createRef()

    componentDidMount(): void {
        const rootE = this.containerRef.current as Element
        this.initList(rootE)
    }

    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    getPostType(item: Post): SectionType {
        return getSectionTypeByPath(item.path)
    }

    /**
     * 获取一个文章要显示的块，包括author作者、actor演员、mention提到
     * 显示，一共就2个block，用不同的颜色区分
     * @param author 作者
     * @param actor 演员
     * @param mention 提到
     * @param location 地点
     * @param postType 文章类型
     * @returns [block1, block2]
     */
    getPostBlocks(author: string, actor: Array<string>, mention: Array<string>, location: string, postType: SectionType): [string[], string[]] {
        if (postType.identifier === SECTION_TYPE_ORIGINAL.identifier) {
            // 随笔，不显示 author，显示 actor、mention、location
            if (location.length > 0) {
                return [actor, mention.concat(location)]
            } else {
                return [actor, mention]
            }
        } else if (postType.identifier === SECTION_TYPE_OPERA.identifier) {
            // 看剧，显示 actor、mention、location
            if (location.length > 0) {
                return [actor, mention.concat(location)]
            } else {
                return [actor, mention]
            }
        } else {
            // 其它类型，显示 author、mention
            return [[author], mention]
        }
    }

    render() {
        const items = this.props.list.map((item) => {
            const postType = this.getPostType(item)
            const postBlocks = this.getPostBlocks(item.author, item.actor, item.mention, item.location, postType)
            // 两个 chip 列表
            return new PostItemData(item.path, item.title, item.date, postType.name, postBlocks[0], postBlocks[1])
        })
        return (
            <ul ref={this.containerRef} className="mdc-deprecated-list">
                {items.map((item, index) =>
                    <PostItem
                        key={item.title + item.date}
                        data={item}
                        first={index === 0}
                        last={index === (items.length - 1)}
                    />
                )}
            </ul>
        )
    }
}


export class PostItemData {
    url: string
    title: string
    date: string
    type: string
    block1Array: string[]
    block2Array: string[]

    constructor(url: string,
        title: string,
        date: string,
        type: string,
        block1Array: string[],
        block2Array: string[]) {
        this.url = url
        this.title = title
        this.date = date
        this.type = type
        this.block1Array = block1Array
        this.block2Array = block2Array
    }
}

interface PostItemProps {
    data: PostItemData
    first: boolean
    last: boolean
}

class PostItem extends React.Component<PostItemProps, any> {
    private containerRef: React.RefObject<HTMLLIElement | null> = React.createRef()
    private liE: HTMLElement | null = null

    componentDidMount(): void {
        const rootE = this.containerRef.current as Element
        this.liE = rootE.querySelector(".mdc-deprecated-list-item") as HTMLElement
        setupListItemRipple(this.liE)
    }

    render() {
        const date = getSplittedDate(this.props.data.date);
        return (
            <li ref={this.containerRef}>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken tag-list-item mdc-ripple-upgraded"
                    tabIndex={-1} href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text tag-list-item__secondary-container">
                            <span className="tag-list-item__block-container">
                                <span className="tag-list-item__post-type">
                                    {date.year}<span className="year">年</span>
                                    {date.month}<span className="month">月</span>
                                    {date.day}<span className="day">日</span>
                                    ｜{this.props.data.type}</span>
                                {this.props.data.block1Array.map((value, index) =>
                                    <Block type={1} title={value} />
                                )}
                                {this.props.data.block2Array.map((value, index) =>
                                    <Block type={2} title={value} />
                                )}
                            </span>
                        </div>
                    </span>
                </a>
                <hr className="mdc-deprecated-list-divider" />
            </li>
        )
    }
}

interface BlockProps {
    type: number,
    title: string,
}

function Block(props: BlockProps) {
    const { type, title } = props
    const [classList, setClassList] = useState<string[]>([])

    useEffect(() => {
        const classes: string[] = []
        if (type === 1) {
            classes.push("tag-list-item__post-block1")
        } else if (type === 2) {
            classes.push("tag-list-item__post-block2")
        }
        setClassList(classes)
    }, [type, title])

    return (
        <span className={classList.join(" ")}>{title}</span>
    )
}

let openCount = 0
export function showTagDialog(_tag: string) {
    consoleDebug("ShowTagDialog " + _tag)
    showDialog(<TagDialog openCount={openCount++} tag={_tag} />, TAG_DIALOG_WRAPPER_ID + "-" + _tag)
    // OnClickBtn={null} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID)
}
