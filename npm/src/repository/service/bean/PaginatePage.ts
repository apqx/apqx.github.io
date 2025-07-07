import type { ApiPost } from "./Post"

export type PaginatePage = {
    "data": {
        "totalPosts": number,
        "totalPages": number,
        "postsPerPage": number,
        "currentPageIndex": number,
        "previousPagePath": string,
        "nextPagePath": string
    },
    "posts": Array<ApiPost>
}