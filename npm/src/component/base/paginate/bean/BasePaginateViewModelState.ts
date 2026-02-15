export interface BasePaginateViewModelState<T> {
    loading: boolean,
    loadingHint?: string,
    posts: Array<T>,
    totalPostsSize: number
}