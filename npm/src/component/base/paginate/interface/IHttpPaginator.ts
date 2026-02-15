/**
 * H 代表从 http 获得的原始数据类型，T 代表要显示的数据类型
 */
export interface IHttpPaginator<H, T> {
    /**
     * 加载首页数据
     * @param delay 是否延迟加载，默认为 false
     * @returns 返回完整数组
     */
    load(delay?: boolean): Promise<T[]>

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
     * 将从 http 获得的原始数据转换为要显示的数据
     * @param data 原始数据 item
     */
    convertToShowData(data: H): T
}