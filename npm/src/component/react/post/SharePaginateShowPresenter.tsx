import type { ApiShare } from "../../../repository/bean/service/ApiShare";
import { BasePaginateShowPresenter } from "./BasePaginateShowPresenter";

export type Share = {
    "title": string,
    "titleNoDate": boolean,
    "date": string,
    "actor": string,
    "location": string,
    "linkTitle": string,
    "linkUrl": string,
    "linkPwd": string,
    "archive": boolean,
}

export class SharePaginateShowPresenter extends BasePaginateShowPresenter<Share> {
    // constructor(component: BasePostPaginateShow<Post, BasePaginateShowProps<Post>>) {
    //     super(component)
    // }

    // item 是 ApiPost 类型的对象
    getPostForShow(_item: any): Share {
        let item = _item as ApiShare;
        const post = {
            title: item.title,
            titleNoDate: item.titleNoDate == "true",
            date: item.date,
            actor: item.actor,
            location: item.location,
            linkTitle: item.linkTitle,
            linkUrl: item.linkUrl,
            linkPwd: item.linkPwd,
            archive: item.archive == "true"
        };
        return post;
    }
}