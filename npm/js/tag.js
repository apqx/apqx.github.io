import {runOnHtmlDone} from "./util/tools";
import {showTagEssayListDialog} from "./component/TagEssayListDialog";
import {console_debug, console_error} from "./util/logutil";

const POST_TYPE_ORIGINAL = ["original", "随笔"]
const POST_TYPE_REPOST = ["repost", "转载"]
const POST_TYPE_POETRY = ["poetry", "诗文"]
const POST_TYPE_OPERA = ["opera", "看剧"]

/**
 * 在archives/posts.txt保存着所有文章及对应tag的列表，只请求一次
 * {
 *     "posts":[
 *         {
 *             "title":"昆曲「西厢记·跳墙着棋」折子",
 *             "date":"2022年08月21日",
 *             "url":"/post/opera/2022/08/21/%E6%98%86%E6%9B%B2-%E8%A5%BF%E5%8E%A2%E8%AE%B0-%E8%B7%B3%E5%A2%99%E7%9D%80%E6%A3%8B-%E6%8A%98%E5%AD%90.html",
 *             "author":"立泉",
 *             "actor":"张唐逍 吴心怡 席秉琪",
 *             "mention":"王翼骅",
 *             "tag":"看剧,摄影,戏剧,杭州,昆曲,浙昆,西厢记,跳墙着棋,张唐逍,吴心怡,席秉琪,王翼骅,杭州大剧院·可变剧场",
 *             "categories":"opera"
 *         },
 *     ]
 * }
 */
let postJson = undefined

runOnHtmlDone(() => {
    initTagTriggers()
})

/**
 * 初始化tag的点击事件
 */
function initTagTriggers() {
    // tag对应的Dialog
    // 获取每一个标记了tag-dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
    // 所有tag共用一个dialog
    const dialogsTriggers = document.querySelectorAll(".tag-dialog-trigger")

    // 为每一个tag添加点击监听
    for (const trigger of dialogsTriggers) {
        // 获取每一个trigger的id，找到它对应的dialogId，和dialog里的listId
        console_debug(trigger.id)
        // 监听trigger的点击事件
        trigger.addEventListener("click", clickTag)
    }
}

function clickTag() {
    // TODO: 为什么使用event.target.id不可以？？
    const chipId = this.id
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    // chip_tag_碎碎念&看剧 可以指定多个tag，用 & 分隔
    console_debug("click tag " + chipId)
    // 这里的tag可能是由&连接的多个tag
    const tag = chipId.replace("chip_tag_", "")
    // 只在无数据时请求
    if (postJson !== undefined && postJson !== null) {
        showTagItemList(postJson, tag)
    } else {
        showTagEssayListDialog(tag, undefined, true)
        setTimeout(() => {
            queryTagItemList(tag)
        }, 1000)
    }
}

/**
 *
 * @param {string} tag 未处理的标签，url种的tag需要进行一些处理：小写，部分字符用 - 代替
 */
function queryTagItemList(tag) {
    const url = window.location.origin + "/archives/posts.txt"
    console_debug("queryTagItemList " + url)
    const request = new Request(url, {
        method: "GET"
    })
    // 异步请求
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text()
            } else {
                throw new Error("Something went wrong on api server!")
            }
        })
        .then(response => {
            postJson = JSON.parse(response)
            showTagItemList(postJson, tag)
        }).catch(error => {
            console_error(error)
            showTagEssayListDialog(tag, undefined, false)
        }
    )
}

function showTagItemList(postJson, tag) {
    const posts = findPost(tag, postJson)
    const essayList = []
    for (const post of posts) {
        const postType = getPostType(post.categories)
        const blocks = getPostBlocks(post.author, post.actor, post.mention, postType)
        const essayForShow = {
            url: post.url,
            title: post.title,
            date: post.date,
            type: postType[1],
            block1Array: blocks[0],
            block2Array: blocks[1]
        }
        essayList.push(essayForShow)
    }
    showTagEssayListDialog(tag, essayList, false)
}

function getPostType(categories) {
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
 * @param {string} author
 * @param {string} actor
 * @param {string} mention
 * @param {string} postType
 */
function getPostBlocks(author, actor, mention, postType) {
    const actorArray = actor === "" ? [] : actor.split(" ")
    const mentionArray = mention === "" ? [] : mention.split(" ")
    if (postType[0] === POST_TYPE_ORIGINAL[0]) {
        // 随笔，不显示author和actor，显示mention
        return [actorArray, mentionArray]
    } else if (postType[0] === POST_TYPE_OPERA[0]) {
        // actor只在看剧中出现
        // 看剧，显示actor和mention
        return [actorArray, mentionArray]
    } else {
        // 其它类型，显示author和mention
        return [[author], mentionArray]
    }
}

/**
 *
 * @param {string} tags
 * @param {string} postJson
 */
function findPost(tags, postJson) {
    const tagArray = tags.split("&")
    const resultArray = []
    for (const post of postJson.posts) {
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

