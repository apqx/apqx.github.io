import "./TagDialog.scss"
import { MDCList } from "@material/list"
import { MDCRipple } from "@material/ripple"
import { BasicDialog, TAG_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import { initListItem } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import { HeightAnimationContainer } from "../animation/HeightAnimationContainer"
import { BasePostPaginateShow } from "../react/post/BasePostPaginateShow"
import type { BasePostPaginateShowProps, Post } from "../react/post/BasePostPaginateShow"
import type { IPostPaginateShowPresenter } from "../react/post/IPostPaginateShowPresenter"
import { PostPaginateShowPresenter } from "../react/post/PostPaginateShowPresenter"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL } from "../../base/constant"
import type { SectionType } from "../../base/constant"
import { DialogState, DialogStateObservable, DialogStateObserver } from "./DialogStateObservable"
import type { JSX } from "react"
import React from "react"

interface DialogContentProps extends BasicDialogProps {
    tag: string,
}

interface DialogContentState {
}

export class TagDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    heightAnimationContainer: HeightAnimationContainer | undefined
    dialogStateObservable: DialogStateObservable

    constructor(props: DialogContentProps) {
        super(props)
        consoleDebug("TagDialogContent constructor")
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

    scrollNearToBottom(): void {
        this.dialogStateObservable.notify(DialogState.LOAD_MORE)
    }

    onListSizeChanged() {
        this.heightAnimationContainer?.update()
    }

    componentDidMount() {
        super.componentDidMount()
        consoleDebug("TagDialogContent componentDidMount")
        this.heightAnimationContainer = new HeightAnimationContainer(this.rootE!!.querySelector(".height-animation-container")!!)
    }

    componentWillUnmount(): void {
        if (this.heightAnimationContainer != null) this.heightAnimationContainer.destroy()
    }

    dialogContent(): JSX.Element {
        consoleDebug("TagDialogContent render")

        return (
            <div className="height-animation-container">
                <ResultWrapper category={""} tag={this.props.tag} pinedPosts={[]} loadedPosts={[]}
                    onUpdate={this.onListSizeChanged} dialogStateObservable={this.dialogStateObservable} />
            </div>
        )
    }
}

interface ResultWrapperProps extends BasePostPaginateShowProps {
    dialogStateObservable: DialogStateObservable
}

class ResultWrapper extends BasePostPaginateShow<ResultWrapperProps> {
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

    createPresenter(): IPostPaginateShowPresenter {
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
            // 两个chip列表
            return new PostItemData(item.path, item.title, item.date, postType.name, postBlocks[0], postBlocks[1])
        })
        return (
            <ul ref={this.containerRef} className="mdc-deprecated-list">
                {items.map((item) =>
                    <PostItem
                        key={item.title + item.date}
                        data={new PostItemData(item.url, item.title, item.date, item.type, item.block1Array, item.block2Array)}
                        first={items.indexOf(item) === 0}
                        last={items.indexOf(item) === (this.props.list.length - 1)}
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

    componentDidMount(): void {
        const rootE = this.containerRef.current as Element
        this.initRipple(rootE.querySelector(".mdc-deprecated-list-item")!!)
    }

    initRipple(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        initListItem(e, this.props.first, this.props.last)
    }

    render() {
        return (
            <li ref={this.containerRef}>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken tag-list-item mdc-ripple-upgraded"
                    tabIndex={-1} href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text tag-list-item__secondary-container">
                            {/* <span>{this.props.data.date}</span> */}
                            <span>
                                <span className="tag-list-item__post-type">{this.props.data.date}｜{this.props.data.type}</span>
                            </span>
                            <span className="tag-list-item__block-container">
                                {this.props.data.block1Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-list-item__post-block1">{block}</span>
                                )}
                                {this.props.data.block2Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-list-item__post-block2">{block}</span>
                                )}
                            </span>
                        </div>
                    </span>
                </a>
                {!this.props.last && <hr className="mdc-deprecated-list-divider" />}
            </li>
        )
    }
}

let openCount = 0
export function showTagDialog(_tag: string) {
    consoleDebug("TagDialogContent showTagEssayListDialog " + _tag)
    showDialog(<TagDialog openCount={openCount++} tag={_tag} fixedWidth={true} btnText={"关闭"}
        OnClickBtn={undefined} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID + "-" + _tag)
    // OnClickBtn={null} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID)
}
