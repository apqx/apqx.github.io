import type { ApiPost } from "../../../repository/bean/service/ApiPost"
import { BaseHttpPaginator } from "./BaseHttpPaginator"
import type { Post } from "./bean/Post"

export class PostHttpPaginator extends BaseHttpPaginator<ApiPost, Post> {
        convertToShowData(data: ApiPost): Post {
            return {
                title: data.title,
                date: data.date,
                moreDate: data.moreDate,
                path: data.path,
                author: data.author,
                actors: data.actor != null && data.actor.length > 0 ? data.actor.split(" ") : [],
                mentions: data.mention != null && data.mention.length > 0 ? data.mention.split(" ") : [],
                location: data.location,
                description: data.description,
                cover: data.cover,
                indexCover: data["index-cover"],
                coverAlt: data["cover-alt"],
                tags: data.tags,
                category: data.categories,
                pinned: data.pinned == "true",
                featured: data.featured == "true"
            }
        }
}