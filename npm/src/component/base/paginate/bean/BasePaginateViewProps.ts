export interface BasePaginateViewProps<T> {
    category: string,
    tag: string,
    pinnedPosts: Array<T>,
    loadedPosts: Array<T>,
    onMount?: () => void,
}