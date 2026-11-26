import type { ApiCover } from "../../repository/bean/service/ApiCover"
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO } from "../../repository/Service"
import { consoleInfo, consoleInfoObj } from "../../util/log"
import { BaseExternalStore } from "../base/paginate/BaseExternalStore"
import { LOADING_HINT_ERROR } from "./LoadingHint"

export interface IndexLinearCoverViewModelState {
    loading: boolean,
    loadingHint?: string,
    cover?: ApiCover
}

export class IndexLinearCoverViewModel extends BaseExternalStore {
    private category: string
    state: IndexLinearCoverViewModelState
    abortController?: AbortController

    constructor(category: string) {
        super()
        this.category = category
        this.state = {
            loading: false,
            loadingHint: undefined,
            cover: undefined
        }
    }

    async load() {
        if (this.state.loading) return
        consoleInfo(`IndexLinearCoverViewModel load, category is ${this.category}`)
        this.abortController?.abort()
        this.abortController = new AbortController()
        try {
            this.state = {
                loading: true,
                loadingHint: undefined,
                cover: undefined
            }
            this.emitChange()

            const serviceConfig = { debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: this.abortController.signal }
            const response = await getServiceInstance().getCoverByCategory(serviceConfig, this.category)
            if (response.status != 200) {
                throw new Error("Something went wrong on api server!")
            }
            const cover = (await response.json()) as ApiCover
            this.abortController.signal.throwIfAborted()
            this.state = {
                loading: false,
                loadingHint: undefined,
                cover: cover
            }
            this.emitChange()
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                consoleInfo("IndexLinearCoverViewModel load aborted")
                return
            }
            consoleInfoObj("Error loading cover", e)
            this.state = {
                ...this.state,
                loading: false,
                loadingHint: LOADING_HINT_ERROR
            }
            this.emitChange()
        }
    }

    abort() {
        this.abortController?.abort()
    }

}