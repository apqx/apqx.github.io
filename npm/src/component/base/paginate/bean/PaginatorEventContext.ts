export const PAGINATOR_EVENT_DEFAULT = "default"
export const PAGINATOR_EVENT_LOAD_MORE = "loadMore"
export const PAGINATOR_EVENT_ABORT = "abort"

export interface PaginatorEvent {
    type: typeof PAGINATOR_EVENT_DEFAULT | typeof PAGINATOR_EVENT_LOAD_MORE | typeof PAGINATOR_EVENT_ABORT
}