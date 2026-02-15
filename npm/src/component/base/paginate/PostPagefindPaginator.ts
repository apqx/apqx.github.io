import type { PagefindResultItem } from "../../../repository/bean/pagefind/ApiPagefindSearch";
import { BasePagefindPaginator } from "./BasePagefindPaginator";
import type { Post } from "./bean/Post";

export class PostPagefindPaginator extends BasePagefindPaginator<PagefindResultItem, Post> {
    convertToShowData(data: PagefindResultItem): Post {
        return {
            title: data.meta.title,
            date: data.meta.date,
            moreDate: "",
            path: data.raw_url,
            author: "",
            actors: [],
            mentions: [],
            location: "",
            description: data.excerpt,
            cover: data.meta.image,
            indexCover: "",
            coverAlt: "",
            tags: [],
            category: "",
            pinned: false,
            featured: false
        }
    }

}