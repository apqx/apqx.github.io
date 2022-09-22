import {EssayItemData, showTagEssayListDialog} from "./component/TagEssayListDialog";
import {console_debug, console_error} from "./util/LogUtil";

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

/**
 * 初始化tag的点击事件
 */
export function initTagTriggers() {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    const dialogsTriggers = document.querySelectorAll(".tag-dialog-trigger")
    // 为每一个tag添加点击监听\
    dialogsTriggers.forEach((trigger) => {
        // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
        console_debug(trigger.id)
        // 监听trigger的点击事件
        trigger.addEventListener("click", clickTag)
    })
}

function clickTag() {
    const chipId = this.id
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
    console_debug("click tag " + chipId)
    // 这里的tag可能是由&连接的多个tag
    const tag = chipId.replace("chip_tag_", "")
    // 只在无数据时请求
    if (postList != null) {
        showTagItemList(postList, tag)
    } else {
        showTagEssayListDialog(tag, undefined, true)
        queryTagItemList(tag)
    }
}

/**
 * @param tag 未处理的标签，url种的tag需要进行一些处理：小写，部分字符用 - 代替
 */
function queryTagItemList(tag: string) {
    const url = window.location.origin + "/archives/posts.txt"
    console_debug("queryTagItemList " + url)
    const request = new Request(url, {
        method: "GET"
    })
    // 异步请求
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error("Something went wrong on api server!")
            }
        })
        .then((response: PostsJson) => {
            postList = response.posts
            showTagItemList(postList, tag)
        }).catch(error => {
            console_error(error)
            showTagEssayListDialog(tag, undefined, false)
        }
    )
}

function showTagItemList(postList: PostItem[], tag: string) {
    const posts = findPost(tag, postList)
    const essayList: EssayItemData[] = []
    for (const post of posts) {
        const postType = getPostType(post.categories)
        const blocks = getPostBlocks(post.author, post.actor, post.mention, postType)
        const essayForShow = new EssayItemData(post.url, post.title, post.date, postType[1],
            blocks[0], blocks[1])
        essayList.push(essayForShow)
    }
    showTagEssayListDialog(tag, essayList, false)
}

function getPostType(categories: string): string[] {
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
function getPostBlocks(author: string, actor: string, mention: string, postType: string[]): [string[], string[]] {
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

function findPost(tags: string, postList: PostItem[]): PostItem[] {
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

