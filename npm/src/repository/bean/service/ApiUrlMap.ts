export interface ApiUrlMap {
    map: UrlMapItem[]
}

export interface UrlMapItem {
    "id": string,
    "target": {
        "path": string,
        "title": string
    }
}