import type { BasePagefindPaginatorOptions } from "../BasePagefindPaginator"

/**
 * P 代表从搜索引擎获得的原始数据类型，T 代表要显示的数据类型
 */
export interface ISearchPaginator<P, T> {
        /**
         * 搜索
         * @param keywords 关键字，为 null 表示返回所有符合 filter 的数据
         * @param options 搜索参数 TODO: 若之后支持更多搜索方式，接口参数需要变化
         * @param delay 是否延迟加载，默认为 false
         * returns 返回完整数组
         */
        search(keywords: string | null, options: BasePagefindPaginatorOptions, delay?: boolean): Promise<T[]>

        /**
         * 加载下一页数据，如果在没有加载首页的情况下调用，则加载首页数据，调用之前应先调用 hasMore() 判断是否还有更多数据
         * @param delay 是否延迟加载，默认为 false
         * @returns 返回完整数组
         */
        loadMore(delay?: boolean): Promise<T[]>

        /**
         * 是否还有更多数据
         */
        hasMore(): boolean

        /**
         * 获取数据总数，只有在加载首页数据后才有值
         */
        totalPostsSize(): number

        /**
         * 中断加载
         */
        abort(): void

        /**
         * 将搜索获得的原始数据转换为要显示的数据
         * @param data 原始数据 item
         */
        convertToShowData(data: P): T
}