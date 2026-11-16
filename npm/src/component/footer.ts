// import "./footer.scss"
import { isIndexPage } from "../base/constant"
import { getEventEmitter, type Events } from "./base/EventBus"
import { FadeAnimationController } from "./animation/FadeAnimationController"
import { AutoShowAnimationController } from "./animation/AutoShowAnimationController"
import type { IAutoShowAnimationController } from "./animation/IAutoShowAnimationController"
import { DelayToTimeGap } from "./base/DelayToTimeGap"
import { showAboutMeDialog } from "./dialog/AboutMeDialog"

let footAnimationController: IAutoShowAnimationController

function initFootAnimationController(autoShow: boolean) {
    const ele = document.querySelector("footer .fade") as HTMLElement | null
    if (footAnimationController == null && ele != null) {
        footAnimationController = new AutoShowAnimationController(new FadeAnimationController(ele), autoShow)
    }
}

const delayToTimeGap = new DelayToTimeGap(400)

export function initFooter() {
    // footer 默认隐藏，监听进入视图时触发动画显示
    if (isIndexPage(document.location.pathname)) {
        // 索引页从空白加载数据，有单独处理，在内容加载后再设置渐进动画，避免闪烁
        // 监听 EventBus 事件
        initFootAnimationController(false)
        getEventEmitter().on("applyFooterDisplayChange", (data: Events["applyFooterDisplayChange"]) => {
            if (data.enabled) {
                delayToTimeGap.delay(() => {
                    footAnimationController.resetIntersectionObserve()
                })
            } else {
                footAnimationController.toggleOpen(false)
            }
        })
    } else {
        // 其它页面，Footer 设置渐进动画
        // 监听元素进入窗口初次显示
        initFootAnimationController(true)
    }
    document.querySelector("footer #link-material-design")?.addEventListener("click", () => {
        import("./dialog/ListDialog").then(module => {
            module.showListDialog("设计与资源", "参考 Material Design 设计风格，依据个人倾向对配色、阴影、层级做取舍，默认采用淡化色彩的版本，实验性支持更具表现力的 Material 3 Expressive。", [
                {
                    title: "Google Material Design", description: "https://m3.material.io",
                    link: "https://m3.material.io", newPage: true
                },
                {
                    title: "Material Design 2 Github", description: "https://github.com/material-components/material-components-web",
                    link: "https://github.com/material-components/material-components-web", newPage: true
                },
                {
                    title: "Material Design 2 Demo", description: "https://material-components.github.io/material-components-web-catalog",
                    link: "https://material-components.github.io/material-components-web-catalog", newPage: true
                },
                {
                    title: "Material Design 3 Github", description: "https://github.com/material-components/material-web",
                    link: "https://github.com/material-components/material-web", newPage: true
                },
                {
                    title: "Material Design 3 Demo", description: "https://material-web.dev",
                    link: "https://material-web.dev", newPage: true
                },
                {
                    title: "Material Theme Builder", description: "https://material-foundation.github.io/material-theme-builder",
                    link: "https://material-foundation.github.io/material-theme-builder", newPage: true
                },
                {
                    title: "Material Symbols & Fonts", description: "https://fonts.google.com/icons",
                    link: "https://fonts.google.com/icons", newPage: true
                },
                {
                    title: "Noto Animated Color Emoji", description: "https://googlefonts.github.io/noto-emoji-animation",
                    link: "https://googlefonts.github.io/noto-emoji-animation/", newPage: true
                },
            ])
        })
    })

    document.querySelector("footer #link-build")?.addEventListener("click", () => {
        import("./dialog/ListDialog").then(module => {
            module.showListDialog("构建与依赖", "工程主体使用 Jekyll 将 Markdown 转换为 HTML 静态页面，动态部分由 Vit 构建 TypeScript + SCSS + React 生成浏览器支持的 JavaScript 和 CSS，运行时接管页面组件。", [
                {
                    title: "Jekyll", description: "https://jekyllrb.com",
                    link: "https://jekyllrb.com", newPage: true
                },
                {
                    title: "Vit", description: "https://vite.dev",
                    link: "https://vite.dev", newPage: true
                },
                {
                    title: "React", description: "https://react.dev",
                    link: "https://react.dev", newPage: true
                },
                {
                    title: "TypeScript", description: "https://www.typescriptlang.org",
                    link: "https://www.typescriptlang.org", newPage: true
                },
                {
                    title: "Sass", description: "https://sass-lang.com",
                    link: "https://sass-lang.com", newPage: true
                },
                {
                    title: "Biome", description: "https://biomejs.dev",
                    link: "https://biomejs.dev", newPage: true
                },
                {
                    title: "Lottie-react", description: "https://lottiereact.com",
                    link: "https://lottiereact.com", newPage: true
                },
                {
                    title: "Highlight.js", description: "https://highlightjs.org",
                    link: "https://highlightjs.org", newPage: true
                },
                {
                    title: "Mitt", description: "https://github.com/developit/mitt",
                    link: "https://github.com/developit/mitt", newPage: true
                },
                {
                    title: "QR Code Styling", description: "https://qr-code-styling.com",
                    link: "https://qr-code-styling.com", newPage: true
                },
                {
                    title: "TSlog", description: "https://tslog.js.org",
                    link: "https://tslog.js.org", newPage: true
                },
            ])
        })
    })

    document.querySelector("footer #link-open-source")?.addEventListener("click", () => {
        import("./dialog/ListDialog").then(module => {
            module.showListDialog("开源与版权", "博客代码以 GPL-3.0 协议开源，原创文章以 CC BY-NC-ND 4.0 协议保留著作权，对其中摄影照片与视频保留版权，未经允许不可公开发布或作商业用途。", [
                {
                    title: "Github", description: "https://github.com/apqx/apqx.github.io",
                    link: "https://github.com/apqx/apqx.github.io", newPage: true
                },
                {
                    title: "GPL 3.0", description: "https://www.gnu.org/licenses/gpl-3.0.en.html",
                    link: "https://www.gnu.org/licenses/gpl-3.0.en.html", newPage: true
                },
                {
                    title: "CC BY-NC-ND 4.0", description: "https://creativecommons.org/licenses/by-nc-nd/4.0",
                    link: "https://creativecommons.org/licenses/by-nc-nd/4.0", newPage: true
                }
            ])
        })
    })

    document.querySelector("footer #link-me")?.addEventListener("click", () => {
        showAboutMeDialog()
    })
}


// index 业加载状态
// loading: true，隐藏 footer
// loading: false, show hint，显示 footer
// loading: false, no hint，显示 footer