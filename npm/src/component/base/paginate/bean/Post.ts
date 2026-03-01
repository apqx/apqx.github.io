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
    coverForIndex: string,
    coverAlt: string,
    // width, height
    coverSize?: number[],
    tags: Array<string>,
    category: string,
    pinned: boolean,
    featured: boolean
}