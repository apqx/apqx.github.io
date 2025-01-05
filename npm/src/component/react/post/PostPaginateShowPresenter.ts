import { SECTION_TYPE_POETRY } from "../../../base/constant";
import { PaginatePage } from "../../../repository/service/bean/PaginatePage";
import { consoleError, consoleObjDebug } from "../../../util/log";
import { isDebug, runAfterMinimalTime } from "../../../util/tools";
import { BasePostPaginateShow, Post } from "./BasePostPaginateShow";
import { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter";
import { ERROR_HINT, getLoadHint } from "../LoadingHint";
import { ApiPost } from "../../../repository/service/bean/Post";

export class PostPaginateShowPresenter implements IPostPaginateShowPresenter {
    component: BasePostPaginateShow<any>;
    urlPrefix: string
    cachedPage: PaginatePage[] = null

    minimalLoadTime = 500

    constructor(component: BasePostPaginateShow<any>) {
        this.component = component
    }
    destroy() {

    }

    init() {
        this.cachedPage = []
        const startTime = Date.now()
        this.component.setState({
            loading: true
        })
        if (isDebug()) {
            this.urlPrefix = window.location.origin
        } else {
            this.urlPrefix = "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog"
        }
        let url = ""
        if (this.component.props.tag.length > 0) {
            url = this.urlPrefix + "/api/paginate/tags/" + this.component.props.tag + "/page-1.json"
        } else {
            url = this.urlPrefix + "/api/paginate/categories/" + this.component.props.category + "/page-1.json"
        }

        const request = new Request(url, {
            method: "GET"
        })

        fetch(request, { cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index api first page", page)
                this.cachedPage.push(page)
                this.showPosts(page, false, startTime)
            }).catch(error => {
                consoleError(error)
                runAfterMinimalTime(startTime, () => {
                    this.component.setState({
                        loading: false,
                        loadHint: ERROR_HINT
                    })
                }, this.minimalLoadTime)
            }
            )
    }
    showPosts(page: PaginatePage, add: boolean, startTime: number) {
        const posts = new Array<Post>()
        if (add) {
            // 新加载的一页数据，直接加到已有数据末尾，保留已有数据
            posts.push(...this.component.state.posts)
        }
        for (const item of page.posts) {
            let post = this.getPostForShow(item);
            posts.push(post)
        }
        const updateState = () => {
            this.component.setState({
                loading: false,
                loadHint: getLoadHint(posts.length, page.data.totalPosts),
                posts: posts
            })
        }
        consoleObjDebug("Index update", posts)
        updateState()
    }
    private getPostForShow(item: ApiPost) {
        let author = item.author;
        if (this.component.props.category == SECTION_TYPE_POETRY.identifier && item.moreDate.length > 0) {
            author = item.moreDate + " " + item.author;
        }
        let cover = item.cover;
        if (item["index-cover"].length > 0) {
            cover = item["index-cover"];
        }
        const post = {
            title: item.title,
            author: author,
            actor: item.actor.split(" "),
            mention: item.mention.split(" "),
            date: item.date,
            path: item.path,
            description: item.description,
            cover: cover,
            coverAlt: item["cover-alt"],
            pin: item.pin == "true",
            hide: item.hide == "true"
        };
        return post;
    }

    loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT && this.cachedPage.length == 0) {
            this.init()
            return
        }
        const nextPagePath = this.cachedPage[this.cachedPage.length - 1].data.nextPagePath
        if (nextPagePath.length == 0) {
            this.component.setState({
                loading: false,
                loadHint: null
            })
            return
        }
        const startTime = Date.now()
        this.component.setState({
            loading: true
        })
        const request = new Request(this.urlPrefix + nextPagePath, {
            method: "GET"
        })

        fetch(request, { cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((page: PaginatePage) => {
                consoleObjDebug("Index load page", page)
                this.cachedPage.push(page)
                this.showPosts(page, true, startTime)
            }).catch(error => {
                consoleError(error)
                runAfterMinimalTime(startTime, () => {
                    this.component.setState({
                        loading: false,
                        loadHint: ERROR_HINT
                    })
                }, this.minimalLoadTime)
            }
            )
    }
}