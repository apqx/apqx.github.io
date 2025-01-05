import { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter";

export interface IPostPaginateShow {
    presenter: IPostPaginateShowPresenter

    loadFirstPage()
    loadMore()
    destroy()
}