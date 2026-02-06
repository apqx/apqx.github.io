import "./SearchDialog.scss"
import { SearchDialogPresenter } from "./SearchDialogPresenter"
import { MDCTextField } from "@material/textfield"
import { MDCList } from "@material/list"
import { clearFocusListener, createHtmlContent } from "../../util/tools"
import { BasicDialog, SEARCH_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { ActionBtn, BasicDialogProps } from "./BasicDialog"
import { setupListItemRipple } from "../list"
import { ERROR_HINT, LoadingHint } from "../react/LoadingHint"
import React from "react"
import type { RefObject } from "react"
import { getSplittedDate } from "../../base/post"
import { setupButtonRipple } from "../button"
import { SmoothCollapse } from "../animation/SmoothCollapse"

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

    presenter: SearchDialogPresenter | null = null
    input: string = ""
    textField: MDCTextField | null = null

    constructor(props: any) {
        super(props)
        this.fixedWidth = true
        // 需要显示搜素结果数目，节约带宽，不要滚动加载
        this.listenScroll = false
        this.presenter = new SearchDialogPresenter(this)
        this.onClickSearch = this.onClickSearch.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onClickLoadMore = this.onClickLoadMore.bind(this)
    }

    configActionBtns(): ActionBtn[] {
        return [{
            text: "关闭", closeOnClick: true, onClick: () => { }
        }, {
            text: "清除", closeOnClick: false, onClick: () => {
                this.presenter?.clearResults()
                this.textField!.value = ""
                this.input = ""
            }
        }]
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

    onScrollNearToBottom(): void {
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
        this.initBtn(this.rootE!!.querySelector("#btn-search")!!)
        this.initTextField(this.rootE!!.querySelector("#search-dialog_label")!!)
    }

    componentDidUpdate(prevProps: Readonly<BasicDialogProps>, prevState: Readonly<any>, snapshot?: any): void {
        super.componentDidUpdate(prevProps, prevState, snapshot)
    }

    componentWillUnmount(): void {
    }

    initBtn(e: HTMLElement) {
        if (e == null) return
        setupButtonRipple(e)
        e.addEventListener("focus", clearFocusListener)
    }

    initTextField(e: HTMLElement) {
        if (e == null) return
        this.textField = new MDCTextField(e)
        e.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.key === "Enter")
                this.onClickSearch()
        })
    }

    dialogContent(): React.JSX.Element {
        return (
            <div className="center-items">
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
                        <i className="material-symbols-rounded-light mdc-button__icon" aria-hidden="true">search</i>
                    </button>
                </label>

                <p id="search-dialog_tips"><b>TIPS：</b>中文低频词组用空格分隔会有更好匹配，比如名字「施夏明」改为「施 夏 明」。若网络通畅可使用 <a
                    href="https://cse.google.com/cse?cx=757420b6b2f3d47d2" target="_blank">Google 站内搜索</a>。</p>
                <SmoothCollapse>
                    <div>
                        {(this.state.results != null && this.state.results.length > 0) &&
                            <SearchResult list={this.state.results} />
                        }
                        {(this.state.loading || this.state.loadHint != null) &&
                            <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.onClickLoadMore} />
                        }
                    </div>
                </SmoothCollapse>
            </div>
        )
    }
}

interface SearchResultProps {
    list: ResultItemData[]
}

class SearchResult extends React.Component<SearchResultProps, any> {
    private containerRef: React.RefObject<HTMLUListElement | null> = React.createRef()

    componentDidMount(): void {
        const rootE = this.containerRef.current as Element
        this.initList(rootE)
    }

    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    render() {
        return (
            <ul ref={this.containerRef} className="mdc-deprecated-list">
                {this.props.list.map((item, index) =>
                    <ResultItem key={item.url}
                        data={item} />
                )}
            </ul>
        )
    }
}

interface ResultItemProps {
    data: ResultItemData
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
    private containerRef: RefObject<HTMLLIElement | null> = React.createRef()
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
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken mdc-ripple-upgraded"
                    tabIndex={-1} href={this.props.data.url}>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="list-item__primary-text one-line">{this.props.data.title}</span>
                        <div className="list-item__secondary-text">
                            <span className="search-result-item-type">
                                {date.year}<span className="year">年</span>
                                {date.month}<span className="month">月</span>
                                {date.day}<span className="day">日</span>
                                ｜{this.props.data.type}</span>
                            <span className="search-result-item-snippet"
                                dangerouslySetInnerHTML={createHtmlContent(this.props.data.description)} />
                        </div>
                    </span>
                </a>
                <hr className="mdc-deprecated-list-divider" />
            </li>
        )
    }
}

let openCount = 0
export function showSearchDialog() {
    showDialog(<SearchDialog openCount={openCount++} />, SEARCH_DIALOG_WRAPPER_ID)
}
