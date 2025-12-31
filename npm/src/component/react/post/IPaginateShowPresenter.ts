import type { IPostPaginateShow } from "./IPaginateShow";

export interface IPaginateShowPresenter {
    component: IPostPaginateShow
    
    init(): void

    loadMore(clickLoad: boolean): void

    abortLoad(): void

    isLastPage(): boolean
    
    destroy(): void
}