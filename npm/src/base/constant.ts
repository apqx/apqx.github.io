export const SECTION_TYPE_ORIGINAL: SectionType = {
    identifier: "original",
    name: "随笔",
    indexPath: "/",
    // / /index /index.html /post/original/
    pathRegex: "^((\\/)|(\\/index.*)|(\\/post\\/original\\/.*))$"
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

export const SECTION_TYPE_TAGS: SectionType = {
    identifier: "tags",
    name: "标签",
    indexPath: "/section/tags.html",
    // /section/tags /section/tags.html
    pathRegex: "^(\\/section/tags.*)$"
}

export const SECTION_TYPE_LENS: SectionType = {
    identifier: "lens",
    name: "透镜",
    indexPath: "/section/lens.html",
    // /section/lens /section/lens.html /post/lens/
    pathRegex: "^((\\/section/lens.*)|(\\/post\\/lens\\/.*))$"
}

export const SECTION_TYPE_SHARE: SectionType = {
    identifier: "share",
    name: "分享",
    indexPath: "/page/share.html",
    // /page/share /page/share.html
    pathRegex: "^(\\/page/share.*)$"
}

export const SECTION_TYPE_PRINT: SectionType = {
    identifier: "print",
    name: "印刷",
    indexPath: "/page/print.html",
    // /page/print /page/print.html
    pathRegex: "^(\\/page/print.*)$"
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

/**
 * 获取页面类型，随笔、转载、诗文、看剧、透镜、标签、分享、印刷
 * @param path 页面路径
 * @returns 页面类型
 */
export function getSectionTypeByPath(path: string): SectionType {
    if (path.match(new RegExp(SECTION_TYPE_ORIGINAL.pathRegex))) {
        return SECTION_TYPE_ORIGINAL
    } else if (path.match(new RegExp(SECTION_TYPE_REPOST.pathRegex))) {
        return SECTION_TYPE_REPOST
    } else if (path.match(new RegExp(SECTION_TYPE_POETRY.pathRegex))) {
        return SECTION_TYPE_POETRY
    } else if (path.match(new RegExp(SECTION_TYPE_OPERA.pathRegex))) {
        return SECTION_TYPE_OPERA
    } else if (path.match(new RegExp(SECTION_TYPE_LENS.pathRegex))) {
        return SECTION_TYPE_LENS
    } else if (path.match(new RegExp(SECTION_TYPE_TAGS.pathRegex))) {
        return SECTION_TYPE_TAGS
    } else if (path.match(new RegExp(SECTION_TYPE_SHARE.pathRegex))) {
        return SECTION_TYPE_SHARE
    } else if (path.match(new RegExp(SECTION_TYPE_PRINT.pathRegex))) {
        return SECTION_TYPE_PRINT
    } else {
        return SECTION_TYPE_OTHER
    }
}

/**
 * 是否是索引页，即随笔、转载、诗文、看剧、透镜
 * @param path 页面路径
 */
export function isIndexPage(path: string): boolean {
    // /， /index，/index.html，/section/中非 tags 开头的页面都算作 Index 页面
    return path.match("^((\\/)|(\\/index.*)|(\\/section/(?!tags).*))$") != null 
}

export function isPostPage(path: string): boolean {
    return path.match("^\\/post\\/.*$") != null || (document.querySelector(".content-card") != null && !is404Page(path))
}

export function is404Page(path: string): boolean {
    return path.match("^\\/404.*$") != null || document.querySelector(".container-404") != null
}