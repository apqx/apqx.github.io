import { IPostPaginateShow } from "./IPostPaginateShow";

export interface IPostPaginateShowPresenter {
    component: IPostPaginateShow
    
    init(): void

    loadMore(clickLoad: boolean): void

    abortLoad(): void

    isLastPage(): boolean
    
    destroy(): void
}