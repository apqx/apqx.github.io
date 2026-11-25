import type { ApiPost } from "../../../repository/bean/service/ApiPost"
import { BaseHttpPaginator } from "./BaseHttpPaginator"
import type { Post } from "./bean/Post"
import { convertApiPostToPost } from "./Converter"

export class PostHttpPaginator extends BaseHttpPaginator<ApiPost, Post> {
    convertToShowData(data: ApiPost, pinnedAsFeatured?: boolean): Post {
        return convertApiPostToPost(data, pinnedAsFeatured)
    }
}