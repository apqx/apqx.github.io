import { consoleDebug } from "../util/log";
import { isDebug } from "../util/tools";

var service: Service | null = null;

export const SERVICE_DEBUG_MODE_AUTO = 0
export const SERVICE_DEBUG_MODE_ON = 1
export const SERVICE_DEBUG_MODE_OFF = 2

export const SERVICE_BASE_URL = "https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog";

export interface ServiceConfig {
    debugMode: number,
    abortSignal?: AbortSignal
}


class Service {
    /**
     * 获取指定 tag 的分页数据
     * @param tag 标签
     * @param page 从 1 开始
     * @returns Response 成功 body 的数据类型是 ApiPost 对应的 JSON
     */
    getPostsByTag(config: ServiceConfig, tag: string, page: number): Promise<Response> {
        const url = getBaseUrl(config) + "/api/paginate/tags/" + getFormattedUrlFragment(tag) + "/page-" + page + ".json"
        const request = new Request(url, {
            method: "GET",
            signal: config.abortSignal
        })
        consoleDebug("GetPostsByTag " + url)
        return fetch(request, { cache: "no-cache" })
    }

    /**
    * 获取指定 category 的分页数据
    * @param category 分类
    * @param page 从 1 开始
    * @returns Response 成功 body 的数据类型是 ApiPost 对应的 JSON
    */
    getPostsByCategory(config: ServiceConfig, category: string, page: number): Promise<Response> {
        const url = getBaseUrl(config) + "/api/paginate/categories/" + getFormattedUrlFragment(category) + "/page-" + page + ".json"
        const request = new Request(url, {
            method: "GET",
        })
        consoleDebug("GetPostsByCategory " + url)
        return fetch(request, { signal: config.abortSignal, cache: "no-cache" })
    }

    /**
    * 通过指定 url 获取分页数据
    * @returns Response 成功 body 的数据类型是 ApiPost 对应的 JSON
    */
    getPostsByUrl(config: ServiceConfig, url: string): Promise<Response> {
        url = url.startsWith("http") ? url : getBaseUrl(config) + url
        const request = new Request(url, {
            method: "GET",

        })
        consoleDebug("GetPostsByUrl " + url)
        return fetch(request, { signal: config.abortSignal, cache: "no-cache" })
    }

    /**
     * 获取短链映射
     * @returns Response 成功 body 的数据类型是 ApiUrlMap 对应的 JSON
     */
    getUrlMap(config: ServiceConfig): Promise<Response> {
        const url = getBaseUrl(config) + "/api/url-map.json"
        const request = new Request(url, {
            method: "GET"
        })
        consoleDebug("GetUrlMap " + url)
        return fetch(request, { signal: config.abortSignal, cache: "no-cache" })
    }

    /**
     * 获取短链映射
     * @returns Response 成功 body 的数据类型是 ApiUrlMap 对应的 JSON
     */
    getLensSearchFilters(config: ServiceConfig): Promise<Response> {
        const url = getBaseUrl(config) + "/api/lens-search-filter.json"
        const request = new Request(url, {
            method: "GET"
        })
        consoleDebug("GetLensSearchFilters " + url)
        return fetch(request, { signal: config.abortSignal, cache: "no-cache" })
    }
}

function getBaseUrl(config: ServiceConfig): string {
    var baseUrl = SERVICE_BASE_URL
    if (config.debugMode == SERVICE_DEBUG_MODE_ON || (config.debugMode == SERVICE_DEBUG_MODE_AUTO && isDebug())) {
        baseUrl = window.location.origin
    }
    return baseUrl
}

/**
 * Jekyll 生成的分页文件名会把 Tag、Category 中一些字符替换为 -，需做相应的处理
 */
function getFormattedUrlFragment(str: string): string {
    const regex = new RegExp("[·_]")
    return str.replace(regex, "-").toLowerCase()
}

export function getServiceInstance(): Service {
    if (service == null) {
        service = new Service()
    }
    return service
}