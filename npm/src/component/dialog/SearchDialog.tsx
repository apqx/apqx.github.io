import * as React from "react"
import { SearchDialogPresenter } from "./SearchDialogPresenter"
import { MDCRipple } from "@material/ripple"
import { MDCTextField } from "@material/textfield"
import { MDCList } from "@material/list"
import { clearFocusListener, createHtmlContent } from "../../util/tools"
import { BasicDialog, BasicDialogProps, SEARCH_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import ReactDOM from "react-dom"
import { initListItem } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import { HeightAnimationContainer } from "../animation/HeightAnimationContainer"
// import "./SearchDialog.scss"

interface SearchDialogState {
    loading: boolean
    loadHint: string | null
    results: ResultItemData[]
}

export class SearchDialog extends BasicDialog<BasicDialogProps, SearchDialogState> {
    state: SearchDialogState = {
        loading: false,
        loadHint: null,
        results: [],
    }

    heightAnimationContainer: HeightAnimationContainer | null = null
    presenter: SearchDialogPresenter | null = null
    input: string = ""

    constructor(props: any) {
        super(props)
        // 需要显示搜素结果数目，节约带宽，不要滚动加载
        this.listenScroll = false
        this.presenter = new SearchDialogPresenter(this)
        this.onClickSearch = this.onClickSearch.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onClickLoadMore = this.onClickLoadMore.bind(this)
    }

    onClickSearch() {
        this.presenter?.search(this.input)
    }

    onInputChange(e: React.ChangeEvent<HTMLInputElement>) {

        this.input = e.target.value
    }

    onClickLoadMore() {
        this.presenter?.loadMore()
    }

    scrollNearToBottom(): void {
        if (this.state.loadHint == ERROR_HINT) return
        this.presenter?.loadMore()
    }

    onDialogClose(): void {
        super.onDialogClose()
        this.presenter?.abortSearch()
        // this.presenter.reduceResult()
    }

    componentDidMount(): void {
        super.componentDidMount()
        this.heightAnimationContainer = new HeightAnimationContainer(this.rootE!!.querySelector(".height-animation-container")!!)
        this.initBtn(this.rootE!!.querySelector("#btn-search")!!)
        this.initTextField(this.rootE!!.querySelector("#search-dialog_label")!!)
    }

    componentDidUpdate(prevProps: Readonly<BasicDialogProps>, prevState: Readonly<any>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)
        this.heightAnimationContainer?.update()
    }

    componentWillUnmount(): void {
        if (this.heightAnimationContainer != null) this.heightAnimationContainer.destroy()
    }

    initBtn(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        e.addEventListener("focus", clearFocusListener)
    }

    initTextField(e: HTMLElement) {
        if (e == null) return
        new MDCTextField(e)
        e.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.key === "Enter")
                this.onClickSearch()
        })
    }

    dialogContent(): JSX.Element {
        return (
            <div className="items-center">
                <label className="mdc-text-field mdc-text-field--outlined" id="search-dialog_label">
                    <span className="mdc-notched-outline">
                        <span className="mdc-notched-outline__leading"></span>
                        <span className="mdc-notched-outline__notch">
                            <span className="mdc-floating-label" id="search-label">Words</span>
                        </span>
                        <span className="mdc-notched-outline__trailing"></span>
                    </span>
                    <input type="search" className="mdc-text-field__input" aria-labelledby="search-label"
                        name="search-dialog_input" tabIndex={-1} onChange={this.onInputChange} />
                    <button id="btn-search" type="button"
                        className="mdc-icon-button"
                        tabIndex={-1} onClick={this.onClickSearch}>
                        <i className="material-symbols-rounded-thin mdc-button__icon" aria-hidden="true">search</i>
                    </button>
                </label>

                <p id="search-dialog_tips"><b>TIPS：</b>中文低频词组用空格分隔会有更好匹配，比如输入名字「施夏明」改为「施 夏 明」。如果网络通畅也可使用<a
                    href="https://cse.google.com/cse?cx=757420b6b2f3d47d2" target="_blank">Google站内搜索</a>。</p>
                <div className="height-animation-container">
                    <div>
                        {(this.state.results != null && this.state.results.length > 0) &&
                            <SearchResult list={this.state.results} />
                        }
                        {(this.state.loading || this.state.loadHint != null) &&
                            <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.onClickLoadMore} />
                        }
                    </div>
                </div>

            </div>
        )
    }
}

interface SearchResultProps {
    list: ResultItemData[]
}

class SearchResult extends React.Component<SearchResultProps, any> {

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
                    <ResultItem key={item.url}
                        data={item}
                        first={this.props.list.indexOf(item) === 0}
                        last={this.props.list.indexOf(item) === this.props.list.length - 1} />
                )}
            </ul>
        )
    }
}

interface ResultItemProps {
    data: ResultItemData
    first: boolean
    last: boolean
}

export class ResultItemData {
    title: string
    description: string
    date: string
    url: string
    type: string

    constructor(title: string, description: string, date: string, url: string, type: string) {
        this.title = title
        this.description = description
        this.date = date
        this.url = url
        this.type = type
    }
}

class ResultItem extends React.Component<ResultItemProps, any> {

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.initRipple(rootE.querySelector(".mdc-deprecated-list-item")!!)
    }

    initRipple(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        initListItem(e, this.props.first, this.props.last)
    }

    render() {
        return (
            <li>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken mdc-ripple-upgraded"
                    tabIndex={-1} href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text">
                            <span className="search-result-item-type">{this.props.data.date}｜{this.props.data.type}</span>
                            <span className="search-result-item-snippet"
                                dangerouslySetInnerHTML={createHtmlContent(this.props.data.description)} />
                        </div>
                    </span>
                </a>
                {!this.props.last && <hr className="mdc-deprecated-list-divider" />}
            </li>
        )
    }
}

let openCount = 0
export function showSearchDialog() {
    showDialog(<SearchDialog openCount={openCount++} fixedWidth={true} btnText={"关闭"} OnClickBtn={undefined}
        closeOnClickOutside={true} />, SEARCH_DIALOG_WRAPPER_ID)
}
