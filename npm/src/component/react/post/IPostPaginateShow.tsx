import { IPostPaginateShowPresenter } from "./IPostPaginateShowPresenter";

export interface IPostPaginateShow {
    presenter: IPostPaginateShowPresenter

    /**
     * 加载第一页
     */
    loadFirstPage(): void
    /**
     * 加载更多, 由滚动触发，无动画延时
     */
    loadMore(): void
    /**
     * 加载更多，由点击触发，有动画延时
     */
    loadMoreByClick(): void
    destroy(): void
}