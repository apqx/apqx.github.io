import { consoleDebug } from "../../util/log"
import { toggleClassWithEnable } from "../../util/tools"

// 元素进入窗口初次显示时添加动画
export const interSectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains("index-card--fade-in")) {
                consoleDebug("Index card animation start " + entry.target)
                toggleClassWithEnable(entry.target, "index-card--fade-in-start", true)
            } else if (entry.target.classList.contains("index-card--fade-in-no-translate")) {
                consoleDebug("Index card animation start " + entry.target)
                toggleClassWithEnable(entry.target, "index-card--fade-in-no-translate-start", true)
            } else if (entry.target.classList.contains("content-card--fade-in")) {
                consoleDebug("Content card animation start " + entry.target)
                toggleClassWithEnable(entry.target, "content-card--fade-in-start", true)
            } else if (entry.target.classList.contains("footer--fade-in")) {
                consoleDebug("Footer animation start " + entry.target)
                toggleClassWithEnable(entry.target, "footer--fade-in-start", true)
            }
        }
    })
}, {
    threshold: 0.0
})