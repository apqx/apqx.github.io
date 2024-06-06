import { POST_TYPE_OPERA, POST_TYPE_ORIGINAL, POST_TYPE_OTHER, POST_TYPE_POETRY, POST_TYPE_REPOST, PostType } from "./constant";

export function getPostType(url: string): PostType {
    if (url.indexOf("post/" + POST_TYPE_ORIGINAL.identifier) != -1)
        return POST_TYPE_ORIGINAL
    if (url.indexOf("post/" + POST_TYPE_REPOST.identifier) != -1)
        return POST_TYPE_REPOST
    if (url.indexOf("post/" + POST_TYPE_POETRY.identifier) != -1)
        return POST_TYPE_POETRY
    if (url.indexOf("post/" + POST_TYPE_OPERA.identifier) != -1)
        return POST_TYPE_OPERA
    return POST_TYPE_OTHER
}

export function getPostDate(url: string): string {
    const regExp = new RegExp("(\\d{4})/(\\d{2})/(\\d{2})")
    const matches = url.match(regExp)
    if (matches != null) {
        return matches[1] + "年" + matches[2] + "月" + matches[3] + "日"
    }
    return ""
}