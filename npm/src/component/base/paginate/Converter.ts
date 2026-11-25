import type { ApiPost } from "../../../repository/bean/service/ApiPost";
import { parseImageSize } from "../../../util/tools";
import type { Post } from "./bean/Post";

export function convertApiPostToPost(source: ApiPost, pinnedAsFeatured?: boolean): Post {
    let pinned = source.pinned == "true"
    let featured = source.featured == "true"
    if (pinnedAsFeatured && pinned) {
        pinned = false
        featured = true
    }

    return {
        title: source.title,
        date: source.date,
        moreDate: source.moreDate,
        path: source.path,
        author: source.author,
        actors: source.actor ? source.actor.split(" ") : [],
        mentions: source.mention ? source.mention.split(" ") : [],
        location: source.location,
        description: source.description,
        cover: source.cover,
        coverForIndex: source.coverForIndex,
        coverAlt: source.coverAlt,
        coverSize: parseImageSize(source.coverSize),
        tags: source.tags,
        category: source.categories,
        pinned: pinned,
        featured: featured
    }
}