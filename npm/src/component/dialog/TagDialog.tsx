import * as React from "react"
import { MDCList } from "@material/list"
import { MDCRipple } from "@material/ripple"
import { BasicDialog, BasicDialogProps, TAG_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import ReactDOM from "react-dom"
import { initListItem } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import { HeightAnimationContainer } from "../animation/HeightAnimationContainer"
import { BasePostPaginateShow, BasePostPaginateShowProps, BasePostPaginateShowState, Post } from "../react/post/BasePostPaginateShow"
import { IPostPaginateShowPresenter } from "../react/post/IPostPaginateShowPresenter"
import { PostPaginateShowPresenter } from "../react/post/PostPaginateShowPresenter"
import { getSectionTypeByPath, SECTION_TYPE_OPERA, SECTION_TYPE_ORIGINAL, SectionType } from "../../base/constant"
// import "./TagEssayListDialog.scss"

interface DialogContentProps extends BasicDialogProps {
    tag: string,
}

interface DialogContentState {
    dialogOpened: boolean,
    loadMoreId: number,
}

export class TagDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    heightAnimationContainer: HeightAnimationContainer = null

    constructor(props) {
        super(props)
        consoleDebug("TagDialogContent constructor")
        this.onListSizeChanged = this.onListSizeChanged.bind(this)
        // this.scrollToTopOnDialogOpen = false
        this.listenScroll = true
        this.state = {
            dialogOpened: false,
            loadMoreId: 0,
        }
    }

    onDialogOpen() {
        super.onDialogOpen()
        this.setState({ dialogOpened: true })
    }

    onDialogClose() {
        super.onDialogClose()
        this.setState({ dialogOpened: false })
    }


    scrollNearToBottom(): void {
        this.setState({ loadMoreId: this.state.loadMoreId + 1 })
    }

    onListSizeChanged() {
        this.heightAnimationContainer.update()
    }

    componentDidMount() {
        super.componentDidMount()
        consoleDebug("TagDialogContent componentDidMount")
        this.heightAnimationContainer = new HeightAnimationContainer(this.rootE.querySelector(".height-animation-container"))
    }

    componentWillUnmount(): void {
        if (this.heightAnimationContainer != null) this.heightAnimationContainer.destroy()
    }

    shouldComponentUpdate(nextProps: Readonly<DialogContentProps>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        // 当props或state变化时，判断是否render
        // state变化由内部触发，应该render
        // props变化由外部通过<Dialog>触发，会复用本ReactElement实例，不论props是否变化，都应该render一下，来同步内容和显示
        // 有时候在Element的display为none之后更新render了组件，实际有些尺寸可能是错误的，如果不同步render的话，可能会不一致
        return true
    }

    dialogContent(): JSX.Element {
        consoleDebug("TagDialogContent render")

        return (
            <div className="height-animation-container">
                <ResultWrapper category={""} tag={this.props.tag} pinedPosts={[]} loadedPosts={[]}
                    onUpdate={this.onListSizeChanged} dialogOpened={this.state.dialogOpened}
                    loadMoreId={this.state.loadMoreId} />
            </div>
        )
    }
}

interface ResultWrapperProps extends BasePostPaginateShowProps {
    dialogOpened: boolean
    loadMoreId: number
}

class ResultWrapper extends BasePostPaginateShow<ResultWrapperProps> {

    constructor(props: ResultWrapperProps) {
        super(props)
        this.loadFirstPageOnMount = false
    }

    createPresenter(): IPostPaginateShowPresenter {
        return new PostPaginateShowPresenter(this, true)
    }

    shouldComponentUpdate(nextProps: Readonly<ResultWrapperProps>, nextState: Readonly<BasePostPaginateShowState>, nextContext: any): boolean {
        if (nextProps.loadMoreId > 0 && this.props.loadMoreId != nextProps.loadMoreId &&
            (this.presenter.isLastPage() || this.state.loadHint == ERROR_HINT)) {
            // 如果是最后一页，不触发加载
            // 如果是异常状态，不触发加载，等待用户点击
            return false
        }
        return true
    }

    componentDidUpdate(prevProps: Readonly<ResultWrapperProps>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)
        if (this.props.dialogOpened && !prevProps.dialogOpened && this.state.posts.length == 0) {
            this.loadFirstPage()
        }
        if (!this.props.dialogOpened && prevProps.dialogOpened) {
            this.presenter.abortLoad()
        }
        if (this.props.loadMoreId > 0 && this.props.loadMoreId != prevProps.loadMoreId) {
            this.loadMore()
        }
    }

    render(): React.ReactNode {
        let count: JSX.Element
        if (this.state.posts.length == 0) {
            count = <></>
        } else {
            count = <><span>{this.state.totalPostsSize}</span></>
        }
        return (
            <>
                <p>标记 {this.props.tag} 的{count}篇博文
                </p>
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

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
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
     */
    getPostBlocks(author: string, actor: Array<string>, mention: Array<string>, postType: SectionType): [string[], string[]] {
        if (postType.identifier === SECTION_TYPE_ORIGINAL.identifier) {
            // 随笔，不显示author，显示actor和mention
            return [actor, mention]
        } else if (postType.identifier === SECTION_TYPE_OPERA.identifier) {
            // 看剧，显示actor和mention
            return [actor, mention]
        } else {
            // 其它类型，显示author和mention
            return [[author], mention]
        }
    }

    render() {
        const items = this.props.list.map((item) => {
            const postType = this.getPostType(item)
            const postBlocks = this.getPostBlocks(item.author, item.actor, item.mention, postType)
            // 两个chip列表
            return new PostItemData(item.path, item.title, item.date, postType.name, postBlocks[0], postBlocks[1])
        })
        return (
            <ul className="mdc-deprecated-list">
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

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.initRipple(rootE.querySelector(".mdc-deprecated-list-item"))
    }

    initRipple(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        initListItem(e, this.props.first, this.props.last)
    }

    render() {
        return (
            <li>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken tag-list-item mdc-ripple-upgraded"
                    href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text tag-list-item__secondary-container">
                            <span>{this.props.data.date}</span>
                            <span className="tag-list-item__block-container">
                                <span className="tag-list-item__post-type">{this.props.data.type}</span>
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

export function showTagDialog(_tag: string) {
    consoleDebug("TagDialogContent showTagEssayListDialog " + _tag)
    showDialog(<TagDialog tag={_tag} fixedWidth={true} btnText={"关闭"}
        OnClickBtn={null} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID + "-" + _tag)
    // OnClickBtn={null} closeOnClickOutside={true} />, TAG_DIALOG_WRAPPER_ID)
}
