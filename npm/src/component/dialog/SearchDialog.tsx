import "./SearchDialog.scss"
import { createHtmlContent } from "../../util/tools"
import { BaseDialog, getDialogController, SEARCH_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { ActionBtn, BaseDialogOpenProps } from "./BaseDialog"
import { LOADING_HINT_ERROR, LOADING_HINT_NO_RESULT, LoadingHint } from "../react/LoadingHint"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { getSplittedDate } from "../../base/post"
import { PagefindPaginateViewModel } from "../base/paginate/PagefindPaginateViewModel"
import type { PagefindResultItem } from "../../repository/bean/pagefind/ApiPagefindSearch"
import type { Post } from "../base/paginate/bean/Post"
import { PostPagefindPaginator } from "../base/paginate/PostPagefindPaginator"
import { getSectionTypeByPath } from "../../base/constant"
import { TextField } from "../react/TextField"
import { setupRipple } from "../ripple"
import { LottieAnimation, type LottieAnimationController } from "../react/LottieAnimation"

export function SearchDialog(props: BaseDialogOpenProps) {
    const textInputRef = useRef<string>("")
    const animationControllerRef = useRef<LottieAnimationController | null>(null)
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
    }, [paginateViewModel, pagefindOptions])

    const onDialogOpen = useCallback(() => {
        animationControllerRef.current?.play()
    }, [])

    const onDialogClose = useCallback(() => {
        paginateViewModel.abort()
        animationControllerRef.current?.pause()
    }, [paginateViewModel])

    const onLoadMore = useCallback(() => {
        if (state.loadingHint != LOADING_HINT_ERROR && state.loadingHint != LOADING_HINT_NO_RESULT) {
            // paginateViewModel.loadMore()
        }
    }, [state.loadingHint])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.search(textInputRef.current, pagefindOptions, true)
        }
    }, [paginateViewModel, pagefindOptions, state.posts])

    const actions = useMemo<ActionBtn[]>(() => {
        return [{
            text: "关闭", closeOnClick: true, onClick: () => { }
        }, {
            text: "清除", closeOnClick: false, onClick: () => {
                paginateViewModel.clear()
                textInputRef.current = ""
                setClearInputCounter(prev => prev + 1)
            }
        }]
    }, [paginateViewModel])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} actions={actions}>
            <div className="common-lottie-container">
                <LottieAnimation loop={true} autoplay={true} animationDataUrl={"https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/cow-face/lottie.json"}
                    animationControllerRef={animationControllerRef} />
            </div>
            <TextField label="Search" hint="" inputId="search-dialog-input" classes={["search-dialog_label"]} onTextChange={onTextChange} tabIndex={-1} icon="search"
                onClickIcon={onClickSearch} onClickEnter={onClickSearch} clearInputCounter={clearInputCounter} />

            <p id="search-dialog_tips"><b>TIPS：</b>中文低频词组用空格分隔会有更好匹配，比如名字「施夏明」改为「施 夏 明」。若网络通畅可使用 <a
                href="https://cse.google.com/cse?cx=757420b6b2f3d47d2" target="_blank" rel="noopener" tabIndex={-1}>Google 站内搜索</a>。</p>
            <div>
                {(state.posts != null && state.posts.length > 0) &&
                    <SearchResult list={state.posts} />
                }
                <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
            </div>
        </BaseDialog>
    )
}

interface SearchResultProps {
    list: Post[]
}

function SearchResult(props: SearchResultProps) {
    const containerRef = useRef<HTMLUListElement>(null)

    return (
        <ul ref={containerRef} className="mdm-list">
            {props.list.map((item, _index) =>
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
        const liE = rootE.querySelector(".mdm-list-item") as HTMLElement
        setupRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            <a className="mdm-list-item mdm-list-item-darken" href={props.path} tabIndex={-1}>
                <div className="mdm-list-item__text">
                    <div className="mdm-list-item__primary-text">{props.title}</div>
                    <div className="mdm-list-item__secondary-text">
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
        </li>
    )
}

export function showSearchDialog() {
    const id = SEARCH_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<SearchDialog dialogControllerRef={dialogControllerRef} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}
