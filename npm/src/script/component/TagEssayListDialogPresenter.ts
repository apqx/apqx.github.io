import {TagEssayDialog, EssayItemData} from "./TagEssayListDialog";
import {console_debug, console_error} from "../util/LogUtil";

const POST_TYPE_ORIGINAL = ["original", "随笔"]
const POST_TYPE_REPOST = ["repost", "转载"]
const POST_TYPE_POETRY = ["poetry", "诗文"]
const POST_TYPE_OPERA = ["opera", "看剧"]

/**
 * 在archives/posts.txt保存着所有文章及对应tag的列表，只请求一次
 */
let postList: PostItem[] = null

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
    tag: string
    categories: string

    constructor(title: string,
                date: string,
                url: string,
                author: string,
                actor: string,
                mention: string,
                tag: string,
                categories: string) {
        this.title = title
        this.date = date
        this.url = url
        this.author = author
        this.actor = actor
        this.mention = mention
        this.tag = tag
        this.categories = categories
    }
}

export class TagEssayListDialogPresenter {

    component: TagEssayDialog = null
    abortController: AbortController = null

    constructor(component: TagEssayDialog) {
        this.component = component
    }

    findTaggedEssays(tag: string) {
        this.component.setState({
            showLoading: true,
            // essayList: []
        })
        console_debug("findTaggedEssays " + tag)
        if (postList != null) {
            // 使用本页缓存，避免同一页面下的重复请求
            this.showTagItemList(postList, tag)
            return
        }
        const url = window.location.origin + "/archives/posts.txt"
        const request = new Request(url, {
            method: "GET"
        })
        this.abortController = new AbortController()
        // 异步请求
        // fetch调用浏览器的网络请求，所以会有和浏览器一样的缓存策略
        let promise: Promise<void> = fetch(request, {signal: this.abortController.signal})
            .then((response: Response) => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("Something went wrong on api server!")
                }
            })
            .then((postsJson: PostsJson) => {
                postList = postsJson.posts
                this.showTagItemList(postList, tag)
            }).catch(error => {
                    console_error(error)
                    this.showTagItemList([], tag)
                }
            )
    }

    showTagItemList(postList: PostItem[], tag: string) {
        const posts = this.findPost(tag, postList)
        console_debug("showTagItemList count = " + posts.length)
        const essayListForShow: EssayItemData[] = []
        for (const post of posts) {
            const postType = this.getPostType(post.categories)
            const blocks = this.getPostBlocks(post.author, post.actor, post.mention, postType)
            const essayForShow = new EssayItemData(post.url, post.title, post.date, postType[1],
                blocks[0], blocks[1])
            essayListForShow.push(essayForShow)
        }
        this.component.setState({
            showLoading: false,
            essayList: essayListForShow
        })
    }

    getPostType(categories: string): string[] {
        if (categories.includes(POST_TYPE_ORIGINAL[0])) {
            return POST_TYPE_ORIGINAL
        } else if (categories.includes(POST_TYPE_REPOST[0])) {
            return POST_TYPE_REPOST
        } else if (categories.includes(POST_TYPE_POETRY[0])) {
            return POST_TYPE_POETRY
        } else if (categories.includes(POST_TYPE_OPERA[0])) {
            return POST_TYPE_OPERA
        } else {
            return ["", "未知"]
        }
    }

    /**
     * 获取一个文章要显示的块，包括author作者、actor演员、mention提到
     * 显示，一共就2个block，用不同的颜色区分
     */
    getPostBlocks(author: string, actor: string, mention: string, postType: string[]): [string[], string[]] {
        const actorArray = actor === "" ? [] : actor.split(" ")
        const mentionArray = mention === "" ? [] : mention.split(" ")
        if (postType[0] === POST_TYPE_ORIGINAL[0]) {
            // 随笔，不显示author，显示actor和mention
            return [actorArray, mentionArray]
        } else if (postType[0] === POST_TYPE_OPERA[0]) {
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
            const postTags = post.tag.split(",")
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
        console_debug("find post with tag " + tagArray + ", result size is " + resultArray.length)
        return resultArray
    }

    abortFetch() {
        if (this.abortController != null)
            this.abortController.abort("Abort fetch by user")
    }
}