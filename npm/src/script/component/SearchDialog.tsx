import * as React from "react";
import {SearchDialogPresenter} from "./SearchDialogPresenter";
import {MDCRipple} from "@material/ripple";
import {MDCTextField} from "@material/textfield";
import {Progressbar} from "./Progressbar";
import {MDCList} from "@material/list";
import {createHtmlContent} from "../util/Tools";
import {BasicDialog, BasicDialogProps, showDialog} from "./BasicDialog";


interface SearchDialogState {
    showLoading: boolean
    resultList: ResultItemData[]
    totalPage: number
    currentPage: number
    previousPageStartIndex: number
    nextPageStartIndex: number
    searchText: string
}

export class SearchDialog extends BasicDialog<BasicDialogProps, SearchDialogState> {
    state: SearchDialogState = {
        showLoading: false,
        resultList: null,
        totalPage: 1,
        currentPage: 1,
        previousPageStartIndex: -1,
        nextPageStartIndex: -1,
        searchText: ""
    }

    presenter: SearchDialogPresenter = null
    input: string = ""

    constructor(props: any) {
        super(props);
        this.presenter = new SearchDialogPresenter(this)
        this.onClickSearch = this.onClickSearch.bind(this)
        this.onClickLeftPage = this.onClickLeftPage.bind(this)
        this.onClickRightPage = this.onClickRightPage.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
    }

    onClickSearch() {
        // this.presenter.search(this.input, 1)
        this.presenter.searchJumpGoogle(this.input)
    }

    onClickLeftPage() {
        if (this.state.currentPage <= 1 || this.state.previousPageStartIndex < 0) return
        this.presenter.search(this.state.searchText, this.state.previousPageStartIndex)
    }

    onClickRightPage() {
        if (this.state.currentPage >= this.state.totalPage || this.state.nextPageStartIndex < 0) return
        this.presenter.search(this.state.searchText, this.state.nextPageStartIndex)
    }

    onInputChange(e) {
        this.input = e.target.value
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<SearchDialogState>, snapshot?: any) {
        // DOM更新后，滚动到顶部
        // 只有在搜索结果发生变化时，才滚动
        if (prevState != null && prevState.resultList != this.state.resultList) {
            document.getElementById("basic-dialog-content").scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            )

        }
    }

    initBtn(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    initTextField(e: Element) {
        if (e == null) return
        new MDCTextField(e)
        // TODO: 点击enter搜索
        e.addEventListener("keyup", (event: KeyboardEvent) => {
            if (event.key === "Enter")
                this.onClickSearch()
        })
    }

    dialogContent(): JSX.Element {
        return (
            <div className="center-horizontal">
                <label className="mdc-text-field mdc-text-field--outlined" id="search-dialog_label"
                       ref={e => this.initTextField(e)}>
                    <span className="mdc-notched-outline">
                      <span className="mdc-notched-outline__leading"></span>
                      <span className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label" id="search-label">Bing</span>
                      </span>
                      <span className="mdc-notched-outline__trailing"></span>
                    </span>
                    <input type="search" className="mdc-text-field__input" aria-labelledby="search-label"
                           onChange={this.onInputChange}/>
                    <button type="button" className="mdc-button mdc-button--unelevated btn-search center-horizontal"
                            onClick={this.onClickSearch}
                            ref={e => this.initBtn(e)}>
                        <span className="mdc-button__ripple"></span>
                        <i className="material-icons mdc-button__icon" aria-hidden="true">search</i>
                        <span className="mdc-button__label">SEARCH</span>
                    </button>
                </label>

                <p id="search-dialog_tips"><b>TIPS：</b>本搜索功能由<a
                    href="https://www.bing.com/webmasters/home" target="_blank">必应站内搜索</a>提供，部分内容可能会因索引滞后而尚未被收录。</p>

                <Progressbar loading={this.state.showLoading}/>
                {(this.state.resultList != null && this.state.resultList.length > 0) &&
                    <SearchResult list={this.state.resultList}
                                  currentPage={this.state.currentPage}
                                  totalPage={this.state.totalPage}
                                  onClickLeft={this.onClickLeftPage}
                                  onClickRight={this.onClickRightPage}/>
                }
            </div>
        )
    }
}

interface SearchResultProps {
    list: ResultItemData[]
    currentPage: number
    totalPage: number
    onClickLeft: () => void
    onClickRight: () => void
}

class SearchResult extends React.Component<SearchResultProps, any> {
    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    initRipple(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        if (this.props.list.length <= 0) return false
        return (
            <div>
                <ul className="mdc-deprecated-list dialog-link-list"
                    ref={e => this.initList(e)}>
                    {this.props.list.map((item) =>
                        <ResultItem key={item.url}
                                    data={new ResultItemData(item.title, item.description, item.url)}
                                    isLast={this.props.list.indexOf(item) === this.props.list.length - 1}/>
                    )}
                </ul>
                <div className="search-result-nav-wrapper">
                    <button className="mdc-button btn-search-result-nav mdc-ripple-upgraded mdc-button--outlined"
                            ref={e => this.initRipple(e)}
                            onClick={this.props.onClickLeft}>
                        <span className="mdc-button__ripple"></span>
                        <i className="material-icons mdc-button__icon" aria-hidden="true">chevron_left</i>
                        <span className="mdc-button__label">上一页</span>
                    </button>
                    <span className="search-result-index">{this.props.currentPage + "/" + this.props.totalPage}</span>
                    <button className="mdc-button btn-search-result-nav mdc-ripple-upgraded mdc-button--outlined"
                            ref={e => this.initRipple(e)}
                            onClick={this.props.onClickRight}>
                        <span className="mdc-button__ripple"></span>
                        <span className="mdc-button__label">下一页</span>
                        <i className="material-icons mdc-button__icon" aria-hidden="true">chevron_right</i>
                    </button>
                </div>
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
    url: string

    constructor(title: string, description: string, url: string) {
        this.title = title
        this.description = description
        this.url = url
    }
}

class ResultItem extends React.Component<ResultItemProps, any> {
    initRipple(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <div>
                <a className="mdc-deprecated-list-item search-result-item mdc-ripple-upgraded"
                   href={this.props.data.url}
                   target="_blank"
                   ref={e => this.initRipple(e)}>
                    <span className="mdc-deprecated-list-item__ripple"></span>
                    <div>
                        <p className="search-result-item-title"
                            dangerouslySetInnerHTML={createHtmlContent(this.props.data.title)}/>
                        <p className="search-result-item-snippet"
                           dangerouslySetInnerHTML={createHtmlContent(this.props.data.description)}/>
                    </div>
                </a>
                {!this.props.isLast && <hr className="mdc-deprecated-list-divider"/>}
            </div>
        )
    }
}

export function showSearchDialog() {
    // 是不是每次弹出都是新的空白窗口，不是，SearchDialog组件中的数据是保留的，虽然重新render，但并没有创建新的组件对象
    showDialog(<SearchDialog fixedWidth={true} btnText={"关闭"} btnOnClick={null} closeOnClickOutside={true} />)
}