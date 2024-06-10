import { ReactNode } from "react";
import React from "react";
import ReactDOM from "react-dom";
import { MDCRipple } from "@material/ripple";
import { ImageLoadAnimator } from "../animation/ImageLoadAnimator";
import { ERROR_HINT, LoadingHint } from "./LoadingHint";
import { consoleDebug } from "../../util/log";
import { BasePostPaginateShow, BasePostPaginateShowProps, BasePostPaginateShowState, Post } from "./post/BasePostPaginateShow";
import { IPostPaginateShowPresenter } from "./post/IPostPaginateShowPresenter";
import { PostPaginateShowPresenter } from "./post/PostPaginateShowPresenter";
import { clickTag } from "../tag";
import { ScrollLoader } from "../../base/ScrollLoader";
import Masonry from 'react-masonry-css'
import { HeightAnimationContainer } from "../animation/HeightAnimationContainer";

interface Props extends BasePostPaginateShowProps {
    pageDescriptionHtml: string
}

export class GridIndexList extends BasePostPaginateShow<Props> {
    heightAnimationContainer: HeightAnimationContainer

    constructor(props: Props) {
        super(props);
    }

    createPresenter(): IPostPaginateShowPresenter {
        return new PostPaginateShowPresenter(this)
    }

    loadFirstPage() {
        this.presenter.init()
    }

    destroy() {
        this.presenter.destroy()
    }

    loadMore() {
        this.presenter.loadMore()
    }

    initScroll() {
        const scrollLoader = new ScrollLoader(() => {
            consoleDebug("Index scroll should load")
            if (this.state.loadHint == ERROR_HINT) return
            this.presenter.loadMore()
        })
        window.addEventListener("scroll", () => {
            scrollLoader.onScroll(document.body.clientHeight, window.scrollY, document.body.scrollHeight)
        })
    }

    componentDidMount(): void {
        super.componentDidMount()
        consoleDebug("GridIndex componentDidMount")
        const rootE = ReactDOM.findDOMNode(this) as HTMLElement
        // this.heightAnimationContainer = new HeightAnimationContainer(rootE)
        if (this.props.onUpdate != null) this.props.onUpdate()
        this.initScroll()
    }

    componentWillUnmount(): void {
        // this.heightAnimationContainer.destroy()
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<BasePostPaginateShowState>, snapshot?: any): void {
        consoleDebug("GridIndex componentDidUpdate")
        // this.heightAnimationContainer.update()
        if (this.props.onUpdate != null) this.props.onUpdate()
    }

    render(): ReactNode {
        const breakpointColumnsObj = {
            default: 2,
            600: 1
        };
        return (
            // <div className="height-animation-container">
            <ul className="grid-index-ul">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column">
                    <IndexDescriptionItem innerHtml={this.props.pageDescriptionHtml} />
                    {this.state.posts.map((item: Post, index: number) =>
                        // TODO: 有时候jekyll生成的path和paginate生成的path不一样，导致item重新加载，这种情况并不多
                        !item.pin && !item.hide && <IndexItem key={item.path}
                            index={index}
                            title={item.title}
                            author={item.author}
                            actor={item.actor}
                            date={item.date}
                            path={item.path}
                            description={item.description}
                            cover={item.cover}
                            coverAlt={item.coverAlt} />
                    )}
                    {(this.state.loading || this.state.loadHint != null) &&
                        <li className="grid-index-li">
                            <LoadingHint loading={this.state.loading} loadHint={this.state.loadHint} onClickHint={this.loadMore} />
                        </li>
                    }
                </Masonry>
            </ul>
            // </div>
        )
    }
}

type IndexItemProps = {
    index: number,
    title: string,
    author: string,
    actor: string,
    date: string,
    path: string,
    description: string,
    cover: string,
    coverAlt: string,
}

class IndexItem extends React.Component<IndexItemProps, any> {
    imageLoadAnimator: ImageLoadAnimator

    constructor(props: IndexItemProps) {
        super(props)
    }

    componentDidMount(): void {
        consoleDebug("IndexItem componentDidMount " + this.props.title)
        const rootE = ReactDOM.findDOMNode(this) as HTMLElement
        new MDCRipple(rootE.querySelector(".grid-index-card__ripple"))
        const imgE = rootE.querySelector(".grid-index-cover")
        // 只有前10个有动画🤔
        // if (imgE != null && this.props.index < 10) {
        if (imgE != null) {
            imgE.classList.add("height-animation")
            this.imageLoadAnimator = new ImageLoadAnimator(imgE as HTMLImageElement, -1, false, () => {
            })
        }
    }

    componentWillUnmount(): void {
        consoleDebug("IndexItem componentWillUnmount " + this.props.title)
        if (this.imageLoadAnimator != null) {
            this.imageLoadAnimator.destroy()
        }
    }

    render(): ReactNode {
        return (
            <li className="grid-index-li">
                <a className="index-a mdc-card grid-index-card grid-index-card__ripple" href={this.props.path}>
                    <section>
                        {this.props.cover.length > 0 &&
                            <img className="grid-index-cover" loading="lazy" src={this.props.cover} alt={this.props.coverAlt} />
                        }
                        {this.props.cover.length == 0 &&
                            <div style={{ height: "0.5rem" }}></div>
                        }
                        <div className="grid-index-text-container">
                            <h1 className="grid-index-title">{this.props.title}</h1>
                            <div>
                                <span className="grid-index-date">{this.props.date} {this.props.actor}</span>
                                {/* actor和date放在一起了，因为两个span之间的距离，在原生和react中不一样 */}
                                {/* <span className="grid-index-author">{this.props.actor}</span> */}
                            </div>
                            <p className="grid-index-description">{this.props.description}</p>
                        </div>
                    </section>
                </a>
            </li>
        )
    }
}

type IndexDescriptionItemProps = {
    innerHtml: string,
}

class IndexDescriptionItem extends React.Component<IndexDescriptionItemProps, any> {
    constructor(props: IndexDescriptionItemProps) {
        super(props)
    }

    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as HTMLElement

        const dialogsTriggers = rootE.querySelectorAll(".tag-dialog-trigger")
        for (const trigger of dialogsTriggers) {
            // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
            consoleDebug(trigger.id)
            // 监听trigger的点击事件
            trigger.addEventListener("click", clickTag)
        }
    }

    render(): ReactNode {
        return (
            <li className="grid-index-li grid-index-li--description" dangerouslySetInnerHTML={{ __html: this.props.innerHtml }}></li>
            // <li className="grid-index-li grid-index-li--description">
            //     <section className="mdc-card grid-index-card">
            //         <div className="grid-index-text-container">
            //             <p>2021年08月08日，我在博客里开辟这个分区来承载曾经在剧场看过的剧和拍过的剧照，以昆曲为主，使用<a
            //                 href="{% link _posts/original/2021-09-01-基于Jekyll的博客文章「标签化」.md %}">标签</a>把每一场演出按剧种、剧团、剧目、演员、剧场分类归档。这里的每一篇文章既是记录也是分享，亲手按下快门捕捉到的舞台瞬间，如此美丽的戏妆油彩，不应该只我一人看到。
            //             </p>
            //             <p>关于我与戏剧的渊源以及为什么会喜欢昆曲，参见之前的自述<a
            //                 href="{% link _posts/original/2019-05-18-槐安国内春生酒.md %}">《槐安国内春生酒》</a>，还有一些由看剧衍生的<a
            //                     id="chip_tag_看剧&碎碎念" className="tag-dialog-trigger clickable-empty-link">碎碎念</a>。</p>
            //             <p><em>只是时常偷懒，更新的剧目还不多，我会慢慢整理上传的。</em></p>
            //             <div style={{ marginBottom: "0.2rem" }}>
            //                 <a id="chip_tag_看剧&杭州" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@杭州</a>
            //                 <a id="chip_tag_看剧&南京" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@南京</a>
            //                 <a id="chip_tag_看剧&上海" className="tag-dialog-trigger clickable-empty-link tag-link grid-index-description-tag">@上海</a>
            //                 <a className="tag-link grid-index-description-tag" href="https://space.bilibili.com/11037907" target="_blank">@哔哩</a>
            //             </div>
            //         </div>
            //     </section>
            // </li>
        )
    }
}