import "./SearchDialog.scss"
import { MDCList } from "@material/list"
import { createHtmlContent } from "../../util/tools"
import { BaseDialog, SEARCH_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { ActionBtn, BaseDialogOpenProps } from "./BaseDialog"
import { setupListItemRipple } from "../list"
import { LoadingHint } from "../react/LoadingHint"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { getSplittedDate } from "../../base/post"
import { SmoothCollapse } from "../react/SmoothCollapse"
import { PagefindPaginateViewModel } from "../base/paginate/PagefindPaginateViewModel"
import type { PagefindResultItem } from "../../repository/bean/pagefind/ApiPagefindSearch"
import type { Post } from "../base/paginate/bean/Post"
import { PostPagefindPaginator } from "../base/paginate/PostPagefindPaginator"
import { getSectionTypeByPath } from "../../base/constant"
import { TextField } from "../react/TextField"

export function SearchDialog(props: BaseDialogOpenProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textInputRef = useRef<string>("")
    const [clearInputCounter, setClearInputCounter] = useState(0)

    const paginateViewModel = useMemo(() => {
        return new PagefindPaginateViewModel<PagefindResultItem, Post, PostPagefindPaginator>(new PostPagefindPaginator())
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    const onTextChange = useCallback((value: string) => {
        textInputRef.current = value
    }, [])

    const pagefindOptions = useMemo(() => {
        return {
            filters: {
                category: { any: ["original", "repost", "poetry", "opera"] }
            }
        }
    }, [])

    const onClickSearch = useCallback(() => {
        paginateViewModel.search(textInputRef.current, pagefindOptions, true)
    }, [])

    const onDialogOpen = useCallback(() => {

    }, [])

    const onDialogClose = useCallback(() => {
        paginateViewModel.abort()
    }, [])

    const onLoadMore = useCallback(() => {
        // if (state.loadingHint != LOADING_HINT_ERROR && state.loadingHint != LOADING_HINT_NO_RESULT) {
        //     paginateViewModel.loadMore()
        // }
    }, [state.loadingHint])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.search(textInputRef.current, pagefindOptions, true)
        }
    }, [state.posts])

    const actions = useMemo<ActionBtn[]>(() => {
        return [{
            text: "关闭", closeOnClick: true, onClick: () => { }
        }, {
            text: "清除", closeOnClick: false, onClick: () => {
                paginateViewModel.clear()
                setClearInputCounter(prev => prev + 1)
            }
        }]
    }, [])
    return (
        <BaseDialog openCounter={props.openCounter} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} actions={actions}>
            <div ref={containerRef} className="center-inline-items">
                <TextField label="Words" hint="" classes={["search-dialog_label"]} onTextChange={onTextChange} tabIndex={-1} icon="search" onClickIcon={onClickSearch} clearInputCounter={clearInputCounter} />

                <p id="search-dialog_tips"><b>TIPS：</b>中文低频词组用空格分隔会有更好匹配，比如名字「施夏明」改为「施 夏 明」。若网络通畅可使用 <a
                    href="https://cse.google.com/cse?cx=757420b6b2f3d47d2" target="_blank" tabIndex={-1}>Google 站内搜索</a>。</p>
                <SmoothCollapse>
                    <div>
                        {(state.posts != null && state.posts.length > 0) &&
                            <SearchResult list={state.posts} />
                        }
                        <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
                    </div>
                </SmoothCollapse>
            </div>
        </BaseDialog>
    )
}

interface SearchResultProps {
    list: Post[]
}

function SearchResult(props: SearchResultProps) {
    const containerRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        const rootE = containerRef.current as Element
        new MDCList(rootE)
    }, [])

    return (
        <ul ref={containerRef} className="mdc-deprecated-list">
            {props.list.map((item, index) =>
                <ResultItem key={item.path}
                    title={item.title}
                    description={item.description}
                    date={item.date}
                    path={item.path}
                    type={getSectionTypeByPath(item.path).name} />
            )}
        </ul>
    )
}

interface ResultItemProps {
    title: string
    description: string
    date: string
    path: string
    type: string
}

function ResultItem(props: ResultItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)
    const date = useMemo(() => getSplittedDate(props.date), [props.date])

    useEffect(() => {
        const rootE = containerRef.current as Element
        const liE = rootE.querySelector(".mdc-deprecated-list-item") as HTMLElement
        setupListItemRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken" href={props.path} tabIndex={-1}>
                <div className="mdc-deprecated-list-item__text">
                    <div className="list-item__primary-text">{props.title}</div>
                    <div className="list-item__secondary-text">
                        <span className="search-result-item-type">
                            {date.year}<span className="year">年</span>
                            {date.month}<span className="month">月</span>
                            {date.day}<span className="day">日</span>
                            ｜{props.type}</span>
                        <span className="search-result-item-snippet"
                            dangerouslySetInnerHTML={createHtmlContent(props.description)} />
                    </div>
                </div>
            </a>
            <hr className="mdc-deprecated-list-divider" />
        </li>
    )
}

let openCounter = 0
export function showSearchDialog() {
    showDialog(<SearchDialog openCounter={openCounter++} />, SEARCH_DIALOG_WRAPPER_ID)
}
