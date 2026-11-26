import type { ApiCover } from "../../../repository/bean/service/ApiCover";
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO } from "../../../repository/Service";

export class IndexCoverLoader {

    async load(category: string, abortSignal?: AbortSignal): Promise<ApiCover> {
        const serviceConfig = { debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: abortSignal }
        const response = await getServiceInstance().getCoverByCategory(serviceConfig, category)
        abortSignal?.throwIfAborted()
        if (response.status != 200) {
            throw new Error("Something went wrong on api server!")
        }
        const cover = response.json().then (json => {
            return json as ApiCover
        })
        return cover
    }
}