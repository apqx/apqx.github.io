import * as React from "react"
import { MDCList } from "@material/list"
import { MDCRipple } from "@material/ripple"
import { BasicDialog, BasicDialogProps, TAG_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import { TagDialogPresenter } from "./TagDialogPresenter"
import ReactDOM from "react-dom"
import { initListItem } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import { HeightAnimationContainer } from "../animation/HeightAnimationContainer"
// import "./TagEssayListDialog.scss"

interface DialogContentProps extends BasicDialogProps {
    tag: string,
}

interface DialogContentState {
    loading: boolean,
    resultSize: number,
    postList: PostItemData[]
    loadHint: string
}

export class TagDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    presenter: TagDialogPresenter = null
    heightAnimationContainer: HeightAnimationContainer = null

    constructor(props) {
        super(props)
        consoleDebug("TagDialogContent constructor")
        this.onClickLoadMore = this.onClickLoadMore.bind(this)
        // this.scrollToTopOnDialogOpen = false
        this.listenScroll = true
        this.presenter = new TagDialogPresenter(this)
        this.state = {
            loading: true,
            resultSize: 0,
            postList: [],
            loadHint: null
        }
    }

    onDialogOpen() {
        super.onDialogOpen()
        // 检查是否应该触发fetch数据
        if (this.state.postList.length == 0) {
            this.presenter.findTaggedPosts(this.props.tag)
        }
    }

    onDialogClose() {
        super.onDialogClose()
        this.presenter.abortFetch()
        // this.presenter.reduceResult()
    }

    onClickLoadMore() {
        this.presenter.loadMore(true)
    }

    scrollNearToBottom(): void {
        if (this.state.loadHint == ERROR_HINT) return
        this.presenter.loadMore(false)
    }

    componentDidMount() {
        super.componentDidMount()
        consoleDebug("TagDialogContent componentDidMount")
        this.heightAnimationContainer = new HeightAnimationContainer(this.rootE.querySelector(".height-animation-container"))
    }

    componentDidUpdate(prevProps: Readonly<BasicDialogProps>, prevState: Readonly<any>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)
        this.heightAnimationContainer.update()
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
        let count: JSX.Element
        if (this.state.postList.length == 0) {
            count = <></>
        } else {
            count = <><span>{this.state.resultSize}</span></>
        }
        return (
            <>
                <p className="mdc-theme--on-surface">标记 {this.props.tag} 的{count}篇博文
                </p>

                {/* <ProgressLinear loading={this.state.loading} /> */}
                <div className="height-animation-container">
                    <div>
                        {this.state.postList != null && this.state.postList.length != 0 &&
                            <PostResult list={this.state.postList} />
                        }
                        {(this.state.loading || this.state.loadHint != null) &&
                            <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.onClickLoadMore} />
                        }
                    </div>
                </div>
            </>
        )
    }
}


interface PostResultProps {
    list: PostItemData[]
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

    render() {
        return (
            <ul className="mdc-deprecated-list">
                {this.props.list.map((item) =>
                    <PostItem
                        key={item.title + item.date}
                        data={new PostItemData(item.url, item.title, item.date, item.type, item.block1Array, item.block2Array)}
                        first={this.props.list.indexOf(item) === 0}
                        last={this.props.list.indexOf(item) === (this.props.list.length - 1)}
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
