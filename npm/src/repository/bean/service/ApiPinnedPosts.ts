
export interface ApiPinnedPosts<T> {
    "data": {
        "totalPosts": number
    },
    "posts": Array<T>
}