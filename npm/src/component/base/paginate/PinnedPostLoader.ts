import type { ApiPinnedPosts } from "../../../repository/bean/service/ApiPinnedPosts";
import { getServiceInstance, SERVICE_DEBUG_MODE_AUTO } from "../../../repository/Service";

export class PinnedPostLoader<H> {

    async load(category: string, abortSignal?: AbortSignal): Promise<H[]> {
        const serviceConfig = { debugMode: SERVICE_DEBUG_MODE_AUTO, abortSignal: abortSignal }
        const response = await getServiceInstance().getPinnedPostsByCategory(serviceConfig, category)
        abortSignal?.throwIfAborted()
        if (response.status != 200) {
            throw new Error("Something went wrong on api server!")
        }
        const posts = (await response.json() as ApiPinnedPosts<H>).posts
        return posts
    }
}