
export interface ApiPaginatePage<T> {
    "data": {
        "totalPosts": number,
        "totalPages": number,
        "postsPerPage": number,
        "currentPageIndex": number,
        "previousPagePath": string,
        "nextPagePath": string
    },
    "posts": Array<T>
}