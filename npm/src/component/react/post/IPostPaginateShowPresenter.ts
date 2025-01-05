import { IPostPaginateShow } from "./IPostPaginateShow";

export interface IPostPaginateShowPresenter {
    component: IPostPaginateShow

    init()
    loadMore()
    destroy()
}