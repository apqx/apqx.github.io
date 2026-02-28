import "./LinearShares.scss";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { consoleDebug, consoleObjDebug } from "../../util/log";
import { LoadingHint } from "./LoadingHint";
import { createRoot } from "react-dom/client";
import { HttpPaginatorViewModel } from "../base/paginate/HttpPaginateViewModel";
import { ShareHttpPaginator } from "../base/paginate/ShareHttpPaginator";
import type { ApiShare } from "../../repository/bean/service/ApiShare";
import type { Share } from "../base/paginate/bean/Share";
import type { BasePaginateViewProps } from "../base/paginate/bean/BasePaginateViewProps";

export function initShares() {
    const wrapperE = document.querySelector("#share-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }

    const root = createRoot(wrapperE)
    root.render(<LinearShares tag={""} category={"share"} pinnedPosts={[]} loadedPosts={[]} />)
}

export function LinearShares(props: BasePaginateViewProps<Share>) {
    const paginateViewModel = useMemo(() => {
        const options = {
            tag: props.tag,
            category: props.category,
        }
        return new HttpPaginatorViewModel<ApiShare, ShareHttpPaginator, Share>(new ShareHttpPaginator(options))
    }, [])
    const state = useSyncExternalStore(paginateViewModel.subscribe, () => paginateViewModel.state)

    useEffect(() => {
        consoleDebug(`LinearShares useEffect, tag: ${props.tag}, category: ${props.category}`)
        paginateViewModel.load()

        return () => {
            consoleDebug("LinearShares useEffect cleanup")
        }
    }, [])

    const onLoadMore = useCallback(() => {
        paginateViewModel.loadMore()
    }, [])

    const onClickHint = useCallback(() => {
        if (state.posts.length > 0) {
            paginateViewModel.loadMore(true)
        } else {
            paginateViewModel.load(true)
        }
    }, [state.posts])

    return (
        <ul className="share-ul">
            {state.posts.map((item, index) =>
                <IndexItem key={item.linkUrl}
                    title={item.title} titleNoDate={item.titleNoDate} date={item.date} actor={item.actor} location={item.location}
                    linkTitle={item.linkTitle} linkUrl={item.linkUrl} linkPwd={item.linkPwd} archive={item.archive} />
            )}
            <LoadingHint loading={state.loading} loadHint={state.loadingHint} onClickHint={onClickHint} onLoadMore={onLoadMore} />
        </ul>
    )
}

type IndexItemProps = {
    title: string,
    titleNoDate: boolean,
    date: string,
    actor: string,
    location: string,
    linkTitle: string,
    linkUrl: string,
    linkPwd: string,
    archive: boolean,
}

function IndexItem(props: IndexItemProps) {
    const containerRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        consoleObjDebug("ShareItem mounted", props)
        consoleDebug("archive = " + props.archive)
        const rootE = containerRef.current as HTMLElement;

    }, [])

    /*
    <p><strong class="no-shadow">20250801 浙昆《烂柯山》剧照</strong></p>
    <p class="no-justify em-color">
        钱华仪 鲍晨<br/>
        浙江胜利剧院<br/>
        阿里云盘：<a href="https://www.alipan.com/s/2EY3z5DXyxR" target="_blank">点击链接</a><br/>
        提取码: 09us
    </p>
    */
    return (
        <li ref={containerRef} className="share-li">
            {props.titleNoDate ?
                <p><strong className="no-shadow">{props.title}</strong></p>
                :
                <p><strong className="no-shadow">{props.date} {props.title}</strong></p>
            }
            <p className="no-justify em-color">
                {props.actor != "" && <>{props.actor}<br /></>}
                {props.location != "" && <>{props.location}<br /></>}
                {props.linkTitle}: {props.archive == true ? "已归档" : <a href={props.linkUrl} target="_blank">点击链接</a>}<br />
                提取码: {props.linkPwd}
            </p>
        </li>
    )
}