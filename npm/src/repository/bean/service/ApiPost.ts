export type ApiPost = {
    "title": string,
    "date": string,
    "moreDate": string,
    "path": string,
    "author": string,
    "actor": string,
    "mention": string,
    "location": string,
    "description": string,
    "cover": string,
    "coverForIndex": string,
    "coverAlt": string,
    // 封面尺寸，格式为 6000x4000
    "coverSize": string,
    "tags": Array<string>,
    "categories": string,
    "pinned": string,
    "featured": string
}