import * as React from "react";
import { MDCList } from "@material/list";
import { Progressbar } from "./Progressbar";
import { MDCRipple } from "@material/ripple";
import { BasicDialog, BasicDialogProps, showDialog } from "./BasicDialog";
import { console_debug } from "../util/LogUtil";
import { TagEssayListDialogPresenter } from "./TagEssayListDialogPresenter";

interface DialogContentProps extends BasicDialogProps {
    tag: string,
}

interface DialogContentState {
    showLoading: boolean,
    essayList: EssayItemData[]
}

export class TagEssayDialog extends BasicDialog<DialogContentProps, DialogContentState> {
    presenter: TagEssayListDialogPresenter = null

    constructor(props) {
        super(props)
        console_debug("TagEssayListDialogContent constructor")
        this.presenter = new TagEssayListDialogPresenter(this)
        this.state = {
            showLoading: true,
            essayList: []
        }
    }

    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    onDialogOpen() {
        super.onDialogOpen();
        // 检查是否应该触发fetch数据
        if (this.state.essayList.length == 0) {
            this.presenter.findTaggedEssays(this.props.tag)
        }
    }

    onDialogClose() {
        super.onDialogClose();
        // this.presenter.abortFetch()
    }

    componentDidMount() {
        super.componentDidMount()
        console_debug("TagEssayListDialogContent componentDidMount")
    }

    componentDidUpdate(prevProps: Readonly<DialogContentProps>, prevState: Readonly<DialogContentState>, snapshot?: any) {
        console_debug("TagEssayListDialogContent componentDidUpdate")
    }

    shouldComponentUpdate(nextProps: Readonly<DialogContentProps>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        super.shouldComponentUpdate(nextProps, nextState, nextContext)
        // 当外部以<Tag />的形式重新传入props时，或内部state变化时，这里执行，判断是否要render
        // props是UI的数据id，state则是要展示的UI状态，更新props，会触发重新获取要展示的UI对应的数据，调用setState触发state变化，引起UI变化
        console_debug("TagEssayListDialogContent shouldComponentUpdate" +
            " props: " + this.props.tag + " -> " + nextProps.tag +
            " state: " + this.state.showLoading + " " + this.state.essayList.length + " -> " + nextState.showLoading + " " + nextState.essayList.length)
        if (this.props.tag != nextProps.tag) {
            // props变化，render，要先更新props对应的UI
            // 同时触发获取对应的数据，当数据获取完成后，会自动setState触发state变化，再render
            // TODO: 当props没有变化，但是上次请求失败，不render，重新获取数据
            // TODO: 中途关掉Dialog，应终止presenter可能存在的异步任务
            console_debug("tag different, render")
            this.presenter.findTaggedEssays(nextProps.tag)
            return true
        }
        if (this.state.showLoading != nextState.showLoading ||
            !this.isEssayListSame(this.state.essayList, nextState.essayList)) {
            console_debug("state different, render")
            return true
        }
        console_debug("props and state no change, no render")
        return false
    }

    private isEssayListSame(list1: EssayItemData[], list2: EssayItemData[]) {
        if (list1.length != list2.length) return false
        for (let i = 0; i < list1.length; i++) {
            if (list1[i].url != list2[i].url) return false
        }
        return true
    }

    dialogContent(): JSX.Element {
        console_debug("TagEssayListDialogContent render")
        let count: JSX.Element;
        if (this.state.essayList.length == 0) {
            count = <></>
        } else {
            count = <><span>{this.state.essayList.length}</span>篇</>
        }
        return (
            <>
                <p className="mdc-theme--on-surface">标记
                    <code id="tag-dialog-tag-name"
                        className="language-plaintext highlighter-rouge">{this.props.tag}</code>
                    的{count}博文
                </p>

                <Progressbar loading={this.state.showLoading} />

                {this.state.essayList != null && this.state.essayList.length != 0 &&
                    <ul className="mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list"
                        ref={e => this.initList(e)}>
                        {this.state.essayList.map(item =>
                            <EssayItem
                                key={item.title + item.date}
                                data={new EssayItemData(item.url, item.title, item.date, item.type, item.block1Array, item.block2Array)}
                                isLast={this.state.essayList.indexOf(item) === (this.state.essayList.length - 1)}
                            />
                        )}
                    </ul>
                }
            </>
        )
    }
}

export class EssayItemData {
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

interface EssayItemProps {
    data: EssayItemData
    isLast: boolean
}

class EssayItem extends React.Component<EssayItemProps, any> {
    public initRipple(e) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <div>
                <a className="mdc-deprecated-list-item tag-list-item mdc-ripple-upgraded"
                    href={this.props.data.url}
                    ref={e => this.initRipple(e)}>
                    <span className="mdc-deprecated-list-item__ripple"></span>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="my-list-item__primary-text">{this.props.data.title}</span>
                        <div className="my-list-item__secondary-text">
                            <span>{this.props.data.date}</span>
                            <span className="tag-essay-item-tags-container">
                                <span className="tag-essay-item-post-type">{this.props.data.type}</span>
                                {this.props.data.block1Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block1">{block}</span>
                                )}
                                {this.props.data.block2Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block2">{block}</span>
                                )}
                            </span>
                        </div>
                    </span>
                </a>
                {!this.props.isLast && <hr className="mdc-deprecated-list-divider" />}
            </div>
        )
    }
}

export function showTagEssayListDialog(_tag: string) {
    console_debug("TagEssayListDialogContent showTagEssayListDialog " + _tag)
    showDialog(<TagEssayDialog tag={_tag} fixedWidth={true} btnText={"关闭"}
        btnOnClick={null} closeOnClickOutside={true} />)
}