import { TagDialog, PostItemData } from "./TagDialog"
import { consoleDebug, consoleError } from "../../util/log"
import { isDebug, runAfterMinimalTime } from "../../util/tools"
import { POST_TYPE_OPERA, POST_TYPE_ORIGINAL, POST_TYPE_POETRY, POST_TYPE_REPOST, PostType } from "../../base/constant"
import { ERROR_HINT, getLoadHint } from "../react/LoadingHint"

/**
 * api/posts.json
 */
let cachedPosts: PostItem[] = null
let cachedTagPostsMap: Map<string, PostItem[]> = null
const PAGE_SIZE: number = 10

interface PostsJson {
    posts: PostItem[]
}

class PostItem {
    title: string
    date: string
    url: string
    author: string
    actor: string
    mention: string
    tags: Array<string>
    categories: string

    constructor(title: string,
        date: string,
        url: string,
        author: string,
        actor: string,
        mention: string,
        tags: Array<string>,
        categories: string) {
        this.title = title
        this.date = date
        this.url = url
        this.author = author
        this.actor = actor
        this.mention = mention
        this.tags = tags
        this.categories = categories
    }
}

export class TagDialogPresenter {
    component: TagDialog = null
    abortController: AbortController = null

    constructor(component: TagDialog) {
        this.component = component
    }

    findTaggedPosts(tag: string) {
        consoleDebug("FindTaggedPosts " + tag)
        const startTime = Date.now()
        // loading应至少持续一段时间
        this.component.setState({
            loading: true,
        })
        if (cachedPosts != null) {
            // 使用本页缓存，避免同一页面下的重复请求
            this.showTagItemList(cachedPosts, tag, startTime)
            return
        }
        let urlPrefix: string
        if (isDebug()) {
            urlPrefix = window.location.origin
        } else {
            urlPrefix = "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog"
        }
        const request = new Request(urlPrefix + "/api/posts.json", {
            method: "GET"
        })
        if (this.abortController != null) {
            // 终止之前的任务
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        // 异步请求
        // fetch调用浏览器的网络请求，所以会有和浏览器一样的缓存策略，no-cache会联网检查缓存是否过时，过时则更新缓存，否则使用缓存
        fetch(request, { signal: this.abortController.signal, cache: "no-cache" })
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((postsJson: PostsJson) => {
                cachedPosts = postsJson.posts
                this.showTagItemList(cachedPosts, tag, startTime)
            }).catch(error => {
                consoleError(error)
                runAfterMinimalTime(startTime, () => {
                    this.component.setState({
                        loading: false,
                        loadHint: ERROR_HINT
                    })
                })
            }
            )
    }

    showTagItemList(postList: PostItem[], tag: string, startTime: number) {
        const posts = this.findPost(tag, postList)
        if (cachedTagPostsMap == null) {
            cachedTagPostsMap = new Map()
        }
        if (cachedTagPostsMap.get(this.component.props.tag) == null && posts.length > 0) {
            cachedTagPostsMap.set(this.component.props.tag, posts)
        }
        const totalSize = posts.length
        consoleDebug("ShowTagItemList count = " + posts.length)
        const postsForShow = this.generatePostsForShow(posts, 0, Math.min(totalSize, PAGE_SIZE))
        const loadHint = getLoadHint(postsForShow.length, totalSize)
        runAfterMinimalTime(startTime, () => {
            this.component.setState({
                loading: false,
                resultSize: totalSize,
                postList: postsForShow,
                loadHint: loadHint
            })
        }, 300)
    }

    generatePostsForShow(posts: PostItem[], startIndex: number, size: number): PostItemData[] {
        const postsForShow: PostItemData[] = []
        let count = 0
        for (let i = startIndex; i < posts.length; i++) {
            const post = posts[i]
            if (count >= size) {
                break
            }
            const postType = this.getPostType(post.categories)
            const blocks = this.getPostBlocks(post.author, post.actor, post.mention, postType)
            const postForShow = new PostItemData(post.url, post.title, post.date, postType.name,
                blocks[0], blocks[1])
            postsForShow.push(postForShow)
            count++
        }
        return postsForShow
    }

    loadMore() {
        if (this.component.state.loading) return
        if (this.component.state.loadHint == ERROR_HINT) {
            this.findTaggedPosts(this.component.props.tag)
            return
        }
        const currentSize = this.component.state.postList.length
        const cachedPosts = cachedTagPostsMap.get(this.component.props.tag)
        const totalSize = cachedPosts.length
        if (currentSize >= totalSize) return
        const startTime = Date.now()
        this.component.setState({
            loading: true,
        })
        const loadSize = Math.min(totalSize - currentSize, PAGE_SIZE)
        const newPostsForShow = this.generatePostsForShow(cachedPosts, currentSize, loadSize)
        const postsForShow = this.component.state.postList.concat(newPostsForShow)
        const loadHint = getLoadHint(postsForShow.length, totalSize)
        // runAfterMinimalTime(startTime, () => {
        this.component.setState({
            loading: false,
            resultSize: totalSize,
            postList: postsForShow,
            loadHint: loadHint
        })
        // })
    }

    reduceResult() {
        const totalSize = this.getTotalResultSize(this.component.props.tag)
        const loadSize = this.component.state.postList.length
        if (loadSize > PAGE_SIZE) {
            const array = this.component.state.postList.slice(0, PAGE_SIZE)
            this.component.setState({
                loading: false,
                postList: array,
                loadHint: getLoadHint(PAGE_SIZE, totalSize)
                // dialog弹出时向上滚动，有提示不好看
                // loadHint: null
            })
        }
    }

    private getTotalResultSize(tag: string): number {
        if (cachedTagPostsMap == null || cachedTagPostsMap.get(tag) == null) return 0
        return cachedTagPostsMap.get(tag).length
    }

    getPostType(categories: string): PostType {
        if (categories.includes(POST_TYPE_ORIGINAL.identifier)) {
            return POST_TYPE_ORIGINAL
        } else if (categories.includes(POST_TYPE_REPOST.identifier)) {
            return POST_TYPE_REPOST
        } else if (categories.includes(POST_TYPE_POETRY.identifier)) {
            return POST_TYPE_POETRY
        } else if (categories.includes(POST_TYPE_OPERA.identifier)) {
            return POST_TYPE_OPERA
        } else {
            return {
                identifier: "",
                name: "未知"
            }
        }
    }

    /**
     * 获取一个文章要显示的块，包括author作者、actor演员、mention提到
     * 显示，一共就2个block，用不同的颜色区分
     */
    getPostBlocks(author: string, actor: string, mention: string, postType: PostType): [string[], string[]] {
        const actorArray = actor === "" ? [] : actor.split(" ")
        const mentionArray = mention === "" ? [] : mention.split(" ")
        if (postType.identifier === POST_TYPE_ORIGINAL.identifier) {
            // 随笔，不显示author，显示actor和mention
            return [actorArray, mentionArray]
        } else if (postType.identifier === POST_TYPE_OPERA.identifier) {
            // 看剧，显示actor和mention
            return [actorArray, mentionArray]
        } else {
            // 其它类型，显示author和mention
            return [[author], mentionArray]
        }
    }

    findPost(tags: string, postList: PostItem[]): PostItem[] {
        const tagArray = tags.split("&")
        const resultArray = []
        for (const post of postList) {
            const postTags = post.tags
            let hasBothTag = true
            for (const tag of tagArray) {
                if (!postTags.includes(tag)) {
                    hasBothTag = false
                    break
                }
            }
            if (hasBothTag) {
                resultArray.push(post)
            }
        }
        consoleDebug("Find post with tag " + tagArray + ", result size is " + resultArray.length)
        return resultArray
    }

    abortFetch() {
        if (this.abortController != null) this.abortController.abort()
        if (this.component.state.loading)
            this.component.setState({
                loading: false
            })
    }
}
