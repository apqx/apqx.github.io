import type { ApiPost } from "../../../repository/bean/service/ApiPost"
import { parseImageSize } from "../../../util/tools"
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
                actors: data.actor ? data.actor.split(" ") : [],
                mentions: data.mention ? data.mention.split(" ") : [],
                location: data.location,
                description: data.description,
                cover: data.cover,
                coverForIndex: data.coverForIndex,
                coverAlt: data.coverAlt,
                coverSize: parseImageSize(data.coverSize),
                tags: data.tags,
                category: data.categories,
                pinned: data.pinned == "true",
                featured: data.featured == "true"
            }
        }
}