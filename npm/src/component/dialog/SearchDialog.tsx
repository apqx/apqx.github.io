import * as React from "react"
import { SearchDialogPresenter } from "./SearchDialogPresenter"
import { MDCRipple } from "@material/ripple"
import { MDCTextField } from "@material/textfield"
import { MDCList } from "@material/list"
import { createHtmlContent } from "../../util/tools"
import { BasicDialog, BasicDialogProps, SEARCH_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import ReactDOM from "react-dom"
import { ProgressCircular } from "../react/ProgressCircular"
import { Button } from "../react/Button"
// import "./SearchDialog.scss"

interface SearchDialogState {
    showLoading: boolean
    loadHint: string
    results: ResultItemData[]
    resultSize: number
}

export class SearchDialog extends BasicDialog<BasicDialogProps, SearchDialogState> {
    state: SearchDialogState = {
        showLoading: false,
        loadHint: null,
        results: null,
        resultSize: 0
    }

    presenter: SearchDialogPresenter = null
    input: string = ""

    constructor(props: any) {
        super(props)
        this.presenter = new SearchDialogPresenter(this)
        this.onClickSearch = this.onClickSearch.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onClickLoadMore = this.onClickLoadMore.bind(this)
    }

    onClickSearch() {
        this.presenter.search(this.input)
    }

    onInputChange(e) {
        this.input = e.target.value
    }

    onClickLoadMore() {
        this.presenter.loadMore()
    }

    onDialogClose(): void {
        // this.presenter.clearResult()
    }

    componentDidMount(): void {
        super.componentDidMount()
        const e = ReactDOM.findDOMNode(this) as Element
        this.initBtn(e.querySelector("#btn-search"))
        this.initTextField(e.querySelector("#search-dialog_label"))
    }

    initBtn(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        e.addEventListener("focus", () => {
            e.blur()
        })
    }

    initTextField(e: Element) {
        if (e == null) return
        new MDCTextField(e)
        e.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.key === "Enter")
                this.onClickSearch()
        })
    }

    dialogContent(): JSX.Element {
        const hintBtnClassList = ["search-result-hint-btn"]
        return (
            <div className="center">
                <label className="mdc-text-field mdc-text-field--outlined" id="search-dialog_label">
                    <span className="mdc-notched-outline">
                        <span className="mdc-notched-outline__leading"></span>
                        <span className="mdc-notched-outline__notch">
                            <span className="mdc-floating-label" id="search-label">Words</span>
                        </span>
                        <span className="mdc-notched-outline__trailing"></span>
                    </span>
                    <input type="search" className="mdc-text-field__input" aria-labelledby="search-label"
                        tabIndex={-1} onChange={this.onInputChange} />
                    <button id="btn-search" type="button"
                        className="mdc-button mdc-button--unelevated btn-search btn-round center"
                        tabIndex={-1} onClick={this.onClickSearch}>
                        <span className="mdc-button__ripple"></span>
                        <i className="material-icons mdc-button__icon" aria-hidden="true">search</i>
                        <span className="mdc-button__label">SEARCH</span>
                    </button>
                </label>

                <p id="search-dialog_tips"><b>TIPS：</b>中文低频词组用空格分隔会有更好匹配，比如输入名字「施夏明」改为「施 夏 明」。如果网络通畅也可使用<a
                    href="https://cse.google.com/cse?cx=757420b6b2f3d47d2" target="_blank">Google站内搜索</a>。</p>

                {(this.state.results != null && this.state.results.length > 0) &&
                    <SearchResult list={this.state.results}
                        resultSize={this.state.resultSize} />
                }
                {(this.state.showLoading || this.state.loadHint != null) &&
                    <div className="search-result-nav-wrapper">
                        {this.state.showLoading && <ProgressCircular loading={true} />}
                        {this.state.loadHint != null &&
                            <Button text={this.state.loadHint} onClick={this.onClickLoadMore} classList={hintBtnClassList} />
                        }
                    </div>
                }

            </div>
        )
    }
}

interface SearchResultProps {
    list: ResultItemData[]
    resultSize: number
}

class SearchResult extends React.Component<SearchResultProps, any> {

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.initList(rootE.querySelector(".dialog-link-list"))
    }

    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    render() {
        if (this.props.list.length <= 0) return false
        return (
            <div>
                <ul className="mdc-deprecated-list dialog-link-list">
                    {this.props.list.map((item) =>
                        <ResultItem key={item.url}
                            data={item}
                            isLast={this.props.list.indexOf(item) === this.props.list.length - 1} />
                    )}
                </ul>

            </div>
        )
    }
}

interface ResultItemProps {
    data: ResultItemData
    isLast: boolean
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
        this.initRipple(rootE.querySelector(".mdc-deprecated-list-item"))
    }

    initRipple(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <div>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken mdc-ripple-upgraded"
                    href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__ripple"></span>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text">
                            <span className="search-result-item-type">{this.props.data.date}｜{this.props.data.type}</span>
                            <span className="search-result-item-snippet"
                                dangerouslySetInnerHTML={createHtmlContent(this.props.data.description)} />
                        </div>
                    </span>
                </a>
                {!this.props.isLast && <hr className="mdc-deprecated-list-divider" />}
            </div>
        )
    }
}

export function showSearchDialog() {
    showDialog(<SearchDialog fixedWidth={true} btnText={"关闭"} OnClickBtn={null}
        closeOnClickOutside={true} />, SEARCH_DIALOG_WRAPPER_ID)
}
