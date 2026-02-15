export interface Post {
    title: string,
    date: string,
    moreDate: string,
    path: string,
    author: string,
    actors: string[],
    mentions: string[],
    location: string,
    description: string,
    cover: string,
    indexCover: string,
    coverAlt: string,
    tags: Array<string>,
    category: string,
    pinned: boolean,
    featured: boolean
}