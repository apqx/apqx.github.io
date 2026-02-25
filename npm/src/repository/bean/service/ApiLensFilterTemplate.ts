export interface ApiLensFilterTemplate {
    filters: Array<ApiFilterCategory>
}

export type ApiFilterCategory = {
    id: string,
    title: string,
    tags: ApiFilterTag[]
}

export type ApiFilterTag = {
    title: string,
    sub_tags?: string[],
}