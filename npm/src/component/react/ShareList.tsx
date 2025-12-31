import { useEffect, useRef } from "react";
import { ScrollLoader } from "../../base/ScrollLoader";
import { consoleDebug, consoleObjDebug } from "../../util/log";
import { ERROR_HINT, LoadingHint } from "./LoadingHint";
import { BasePaginateShow, type BasePaginateShowProps, type BasePaginateShowState } from "./post/BasePaginateShow";
import type { IPaginateShowPresenter } from "./post/IPaginateShowPresenter";
import { SharePaginateShowPresenter, type Share } from "./post/SharePaginateShowPresenter";
import "./ShareList.scss";
import { createRoot } from "react-dom/client";

export function initShareList() {
    const wrapperE = document.querySelector("#share-list-wrapper") as HTMLElement
    if (wrapperE == null) {
        return
    }

    const root = createRoot(wrapperE)
    root.render(<IndexList tag={""} category={"share"} pinnedPosts={[]} loadedPosts={[]}
        onMount={() => { }} onUpdate={() => { }} />)
}

export class IndexList extends BasePaginateShow<Share, BasePaginateShowProps<Share>> {

    createPresenter(): IPaginateShowPresenter {
        return new SharePaginateShowPresenter(this, false)
    }

    componentDidMount(): void {
        super.componentDidMount()
        // 不使用高度动画
        // this.heightAnimationContainer = new HeightAnimationContainer(rootE)
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
        // 显示footer，在索引页其被默认隐藏，需要在列表首次加载后显示出来
        // showFooter()
    }

    initScroll() {
        const scrollLoader = new ScrollLoader(() => {
            consoleDebug("Index scroll should load")
            if (this.state.loadHint == ERROR_HINT) return
            this.loadMore()
        })
        window.addEventListener("scroll", () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        })
    }

    componentDidUpdate(prevProps: Readonly<BasePaginateShowProps<Share>>, prevState: Readonly<BasePaginateShowState<Share>>, snapshot?: any): void {
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render() {
        return (
            <ul className="share-ul">
                {this.state.posts.map((item, index) =>
                    <IndexItem key={item.linkUrl}
                        title={item.title} titleNoDate={item.titleNoDate} date={item.date} actor={item.actor} location={item.location} linkTitle={item.linkTitle} linkUrl={item.linkUrl} linkPwd={item.linkPwd} archive={item.archive} last={index == this.state.posts.length - 1} />
                )}
                {(this.state.loading || this.state.loadHint != null) &&
                    <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMoreByClick} />
                }
            </ul>
        )
    }
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
    last: boolean
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