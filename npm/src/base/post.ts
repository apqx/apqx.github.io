import { POST_TYPE_OPERA, POST_TYPE_ORIGINAL, POST_TYPE_POETRY, POST_TYPE_REPOST } from "./constant";

export function getPostType(url: string): string {
    if (url.indexOf("post/" + POST_TYPE_ORIGINAL.identifier) != -1)
        return POST_TYPE_ORIGINAL.name
    if (url.indexOf("post/" + POST_TYPE_REPOST.identifier) != -1)
        return POST_TYPE_REPOST.name
    if (url.indexOf("post/" + POST_TYPE_POETRY.identifier) != -1)
        return POST_TYPE_POETRY.name
    if (url.indexOf("post/" + POST_TYPE_OPERA.identifier) != -1)
        return POST_TYPE_OPERA.name
    return "其它"
}

export function getPostDate(url: string): string {
    const regExp = new RegExp("(\\d{4})/(\\d{2})/(\\d{2})")
    const matches = url.match(regExp)
    if (matches != null) {
        return matches[1] + "年" + matches[2] + "月" + matches[3] + "日"
    }
    return ""
}