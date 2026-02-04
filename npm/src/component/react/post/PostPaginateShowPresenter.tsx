import { SECTION_TYPE_POETRY } from "../../../base/constant";
import type { ApiPost } from "../../../repository/bean/service/ApiPost";
import { BasePaginateShowPresenter } from "./BasePaginateShowPresenter";

export type Post = {
    title: string,
    author: string,
    actor: Array<string>,
    mention: Array<string>,
    location: string,
    date: string,
    path: string,
    description: string,
    cover: string,
    coverAlt: string,
    pinned: boolean,
    featured: boolean,
    hidden: boolean
}

export class PostPaginateShowPresenter extends BasePaginateShowPresenter<Post> {
    // constructor(component: BasePostPaginateShow<Post, BasePaginateShowProps<Post>>) {
    //     super(component)
    // }

    // item 是 ApiPost 类型的对象
    getPostForShow(_item: any): Post {
        let item = _item as ApiPost;
        let author = item.author;
        if (this.component.props.category == SECTION_TYPE_POETRY.identifier && item.moreDate.length > 0) {
            author = item.moreDate + " " + item.author;
        }
        let cover = item.cover;
        if (item["index-cover"].length > 0) {
            cover = item["index-cover"];
        }
        const post = {
            title: item.title,
            author: author,
            actor: item.actor.length == 0 ? [] : item.actor.split(" "),
            mention: item.mention.length == 0 ? [] : item.mention.split(" "),
            location: item.location,
            date: item.date,
            path: item.path,
            description: item.description,
            cover: cover,
            coverAlt: item["index-cover-alt"],
            pinned: item.pinned == "true",
            featured: item.featured == "true",
            hidden: item.hidden == "true"
        };
        return post;
    }
}

