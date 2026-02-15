import type { ApiShare } from "../../../repository/bean/service/ApiShare"
import { BaseHttpPaginator } from "./BaseHttpPaginator"
import type { Share } from "./bean/Share"

export class ShareHttpPaginator extends BaseHttpPaginator<ApiShare, Share> {
    convertToShowData(data: ApiShare): Share {
        return {
            title: data.title,
            titleNoDate: data.titleNoDate == "true",
            date: data.date,
            actor: data.actor,
            location: data.location,
            linkTitle: data.linkTitle,
            linkUrl: data.linkUrl,
            linkPwd: data.linkPwd,
            archive: data.archive == "true"
        }
    }
}