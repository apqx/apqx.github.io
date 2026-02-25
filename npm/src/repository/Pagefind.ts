import { isDebug } from "../util/tools"
import { SERVICE_BASE_URL } from "./Service"

export class PagefindFactory {
    private pagefind?: any

    async getPagefind() {
        await this.checkPagefindReady()
        return this.pagefind
    }

    private async checkPagefindReady() {
        if (this.pagefind != null) return
        let pagefindUrl: string = this.getBaseUrl() + "/pagefind/pagefind.js"
        // vite 会对所有 import 进行打包、拆分，对于 src 中不存在而在网站中存在的 js，打包时会因为找不到而异常
        // 添加此注释可以避免 vite 对这里的 import 打包，而是在运行时引入
        this.pagefind = await import(/*webpackIgnore: true*/ pagefindUrl)
        // await this.pagefind.options({
        //     bundlePath: "/npm/",
        // })
        this.pagefind.init()
    }

    private getBaseUrl(): string {
        if (isDebug()) {
            return window.location.origin + "/assets"
        } else {
            return SERVICE_BASE_URL
        }
    }
}