import type { ApiPagefindFilter } from "../../repository/bean/pagefind/ApiPagefindFilter"
import type { ApiLensFilterTemplate } from "../../repository/bean/service/ApiLensFilterTemplate"
import { PagefindFactory } from "../../repository/Pagefind"
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO } from "../../repository/Service"
import { consoleError, consoleObjDebug, consoleObjError } from "../../util/log"
import { sleepUntilMinimalTime } from "../../util/tools"
import { BaseExternalStore } from "../base/paginate/BaseExternalStore"
import { ERROR_HINT } from "../react/LoadingHint"

interface LensFilterDialogState {
    loading: boolean,
    loadingHint?: string,
    tags: Array<Category>,
    selectedTags: Array<string>,
    confirmedSelectedTags: Array<string>
}

export class LensFilterDialogViewModel extends BaseExternalStore {
    state: LensFilterDialogState
    abortController?: AbortController
    pagefind?: any

    constructor() {
        super()
        this.state = {
            loading: false,
            loadingHint: undefined,
            tags: [],
            selectedTags: [],
            confirmedSelectedTags: []
        }
    }

    async init(delay: boolean = false) {
        if (this.state.loading) return
        if (this.abortController != null) {
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        const startTime = Date.now()
        this.state = {
            ...this.state,
            loading: true,
            loadingHint: undefined
        }
        this.emitChange()
        try {
            await this.loadTags(delay, startTime, this.abortController.signal)
        } catch (e) {
            consoleObjError("Failed to load lens filter options", e)

            await sleepUntilMinimalTime(startTime)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: ERROR_HINT
            }
            this.emitChange()
        }
    }

    async loadTags(delay: boolean, startTime: number, signal: AbortSignal) {
        const filterTemplate: ApiLensFilterTemplate = await getServiceInstance().getLensSearchFilters({ debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: signal })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    throw new Error("GetLensSearchFilters error : " + response.status)
                }
            })
        consoleObjDebug("Get lens filter template", filterTemplate)
        if (this.pagefind == null) {
            this.pagefind = await new PagefindFactory().getPagefind()
        }
        const pagefindFilters: ApiPagefindFilter = await this.pagefind.filters()
        consoleObjDebug("Get pagefind filters", pagefindFilters)

        // pagefind 中的 filter 均为有效标签，但不一定在模版中有配置，需找出未在模版中配置的标签
        // 将 filterTemplate 中的分类和标签与 pagefind 中的过滤项进行对比，找出最终展示的过滤项和未在模版中配置分类的过滤项
        // template 在 pagefind 中不存在的 tag 不显示，pagefind 在 template 中不存在的 tag 在底部显示，提醒需要配置模版
        const tagsNotConfigured: Array<Tag> = []
        const categoriesForShow: Array<Category> = []
        filterTemplate.filters.forEach((category) => {
            const tagsForShow: Array<Tag> = []
            category.tags.forEach(tag => {
                this.checkTag(tag.title, pagefindFilters, tagsForShow)
                if (tag.sub_tags != null) {
                    tag.sub_tags.forEach(subTag => {
                        this.checkTag(subTag, pagefindFilters, tagsForShow)
                    })
                }
            })
            categoriesForShow.push({
                id: category.id,
                title: category.title,
                tags: tagsForShow
            })
        })
        Object.entries(pagefindFilters.tag).forEach(([tagName, count]: [string, number]) => {
            tagsNotConfigured.push({
                title: tagName,
                count: count
            })
        })
        categoriesForShow.push({
            id: "not_configured",
            title: "未配置分类",
            tags: tagsNotConfigured
        })
        consoleObjDebug("Categories for show", categoriesForShow)
        consoleObjDebug("Tags not configured", tagsNotConfigured)
        if (delay) {
            await sleepUntilMinimalTime(startTime, signal)
        }
        this.state = {
            loading: false,
            loadingHint: undefined,
            tags: categoriesForShow,
            selectedTags: [],
            confirmedSelectedTags: []
        }
        this.emitChange()
    }

    checkTag(templateTagName: string, pagefindFilters: ApiPagefindFilter, tagsForShow: Array<Tag>) {
        const pagefindFilterTagCount = pagefindFilters.tag[templateTagName]
        if (pagefindFilterTagCount != null) {
            tagsForShow.push({
                title: templateTagName,
                count: pagefindFilterTagCount ?? 0
            })
            delete pagefindFilters.tag[templateTagName]
        }
    }

    abort() {
        if (this.abortController != null) {
            this.abortController.abort()
        }
    }

    onTagClick(tag: string) {
        const selectedTags = this.state.selectedTags.slice()
        const index = selectedTags.findIndex(it => it == tag)
        if (index != -1) {
            selectedTags.splice(index, 1)
        } else {
            selectedTags.push(tag)
        }
        this.state = {
            ...this.state,
            selectedTags: selectedTags
        }
        this.emitChange()
    }

    restoreSelection() {
        this.state = {
            ...this.state,
            selectedTags: this.state.confirmedSelectedTags
        }
        this.emitChange()
    }

    confirmSelection() {
        this.state = {
            ...this.state,
            confirmedSelectedTags: this.state.selectedTags
        }
    }

}

// tags 为包含 subTag 的扁平化标签列表
export type Category = {
    id: string,
    title: string,
    tags: Array<Tag>
}

type Tag = {
    title: string,
    count: number
}