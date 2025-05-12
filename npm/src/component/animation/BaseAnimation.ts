import { consoleDebug } from "../../util/log"
import { toggleClassWithEnable } from "../../util/tools"

// 元素进入窗口初次显示时添加动画
export const interSectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains("index-card--fade-in")) {
                // 索引的滑入动画，包括透明度和垂直移动
                consoleDebug("Index card animation start " + entry.target)
                if (entry.target.classList.contains("index-card")) {
                    if (window.scrollY > 0) {
                        // 用户滚动之后，使用滑入动画，更灵动
                        toggleClassWithEnable(entry.target, "index-card--fade-in-start", true)
                    } else {
                        // 线性索引，用户滚动之前，使用透明度动画，防止与顶部封面展开动画冲突
                        toggleClassWithEnable(entry.target, "index-card--fade-in-no-translate", true)
                        toggleClassWithEnable(entry.target, "index-card--fade-in", false)
                        toggleClassWithEnable(entry.target, "index-card--fade-in-no-translate-start", true)
                    }
                } else {
                    toggleClassWithEnable(entry.target, "index-card--fade-in-start", true)
                }

            } else if (entry.target.classList.contains("index-card--fade-in-no-translate")) {
                // 索引的透明度动画，不包括垂直移动
                consoleDebug("Index card animation start " + entry.target)
                toggleClassWithEnable(entry.target, "index-card--fade-in-no-translate-start", true)
            } else if (entry.target.classList.contains("content-card--fade-in")) {
                // 内容卡片的滑入动画，包括透明度和垂直移动
                consoleDebug("Content card animation start " + entry.target)
                toggleClassWithEnable(entry.target, "content-card--fade-in-start", true)
            } else if (entry.target.classList.contains("footer--fade-in")) {
                // 页脚的滑入动画，只有透明度，不包括垂直移动
                consoleDebug("Footer animation start " + entry.target)
                toggleClassWithEnable(entry.target, "footer--fade-in-start", true)
            }
        }
    })
}, {
    threshold: 0.0
})