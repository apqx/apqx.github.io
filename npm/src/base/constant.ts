export const POST_TYPE_ORIGINAL: PostType = {
    identifier: "original",
    name: "随笔"
}
export const POST_TYPE_REPOST: PostType = {
    identifier: "repost",
    name: "转载"
}
export const POST_TYPE_POETRY: PostType = {
    identifier: "poetry",
    name: "诗文"
}
export const POST_TYPE_OPERA: PostType = {
    identifier: "opera",
    name: "看剧"
}

export const POST_TYPE_OTHER: PostType = {
    identifier: "other",
    name: "其它"
}

export type PostType = {
    identifier: string,
    name: string
}