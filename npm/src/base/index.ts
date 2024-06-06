import { POST_TYPE_OPERA, POST_TYPE_ORIGINAL, POST_TYPE_OTHER, POST_TYPE_POETRY, POST_TYPE_REPOST, PostType } from "./constant"

export function getIndexType(path: string): PostType {
    if (path == "" || path == "/") return POST_TYPE_ORIGINAL
    if (path.indexOf("section/" + POST_TYPE_REPOST.identifier) != -1)
        return POST_TYPE_REPOST
    if (path.indexOf("section/" + POST_TYPE_POETRY.identifier) != -1)
        return POST_TYPE_POETRY
    if (path.indexOf("section/" + POST_TYPE_OPERA.identifier) != -1)
        return POST_TYPE_OPERA
    return POST_TYPE_OTHER
}