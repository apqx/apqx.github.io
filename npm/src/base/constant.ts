export const SECTION_TYPE_ORIGINAL: SectionType = {
    identifier: "original",
    name: "随笔",
    indexPath: "/",
    // / /index /index.html /post/original/
    pathRegex: "^(\\/|(\\/index.*)|(\\/post\\/original\\/.*))$"
}
export const SECTION_TYPE_REPOST: SectionType = {
    identifier: "repost",
    name: "转载",
    indexPath: "/section/repost.html",
    //  /section/repost /section/repost.html /post/repost/
    pathRegex: "^((\\/section/repost.*)|(\\/post\\/repost\\/.*))$"
}
export const SECTION_TYPE_POETRY: SectionType = {
    identifier: "poetry",
    name: "诗文",
    indexPath: "/section/poetry.html",
    // /section/poetry /section/poetry.html /post/poetry/
    pathRegex: "^((\\/section/poetry.*)|(\\/post\\/poetry\\/.*))$"
}
export const SECTION_TYPE_OPERA: SectionType = {
    identifier: "opera",
    name: "看剧",
    indexPath: "/section/opera.html",
    // /section/opera /section/opera.html /post/opera/
    pathRegex: "^((\\/section/opera.*)|(\\/post\\/opera\\/.*))$"
}

export const SECTION_TYPE_TAG: SectionType = {
    identifier: "tag",
    name: "标签",
    indexPath: "/section/tag.html",
    // /section/tag /section/tag.html
    pathRegex: "^(\\/section/tag.*)$"
}

export const SECTION_TYPE_OTHER: SectionType = {
    identifier: "other",
    name: "其它",
    indexPath: "",
    pathRegex: ""
}

export type SectionType = {
    identifier: string,
    name: string,
    indexPath: string,
    pathRegex: string
}

export function getSectionTypeByPath(path: string): SectionType {
    if (path.match(new RegExp(SECTION_TYPE_ORIGINAL.pathRegex))) {
        return SECTION_TYPE_ORIGINAL
    } else if (path.match(new RegExp(SECTION_TYPE_REPOST.pathRegex))) {
        return SECTION_TYPE_REPOST
    } else if (path.match(new RegExp(SECTION_TYPE_POETRY.pathRegex))) {
        return SECTION_TYPE_POETRY
    } else if (path.match(new RegExp(SECTION_TYPE_OPERA.pathRegex))) {
        return SECTION_TYPE_OPERA
    } else if (path.match(new RegExp(SECTION_TYPE_TAG.pathRegex))) {
        return SECTION_TYPE_TAG
    } else {
        return SECTION_TYPE_OTHER
    }
}