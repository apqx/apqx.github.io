import "./BaseAnimation.scss"
import { consoleObjDebug } from "../../util/log"
import { toggleElementClass } from "../../util/tools"

var interSectionObserver: IntersectionObserver | null = null

export function getInterSectionObserver() {
    if (interSectionObserver == null) {
        // 创建一个新的 IntersectionObserver 实例
        interSectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                // 元素进入视口，触发动画
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains("card-slide-in")) {
                        // 滑入动画，包括透明度和垂直移动，索引页要特殊处理，避免与图片的展开动画冲突
                        handleSlideIn(entry, "card-slide-in", "card-slide-in-start")
                    } else if (entry.target.classList.contains("card-slide-in-middle")) {
                        // 滑入动画，包括透明度和垂直移动，索引页要特殊处理，避免与图片的展开动画冲突
                        handleSlideIn(entry, "card-slide-in-middle", "card-slide-in-middle-start")
                    } else if (entry.target.classList.contains("card-fade-in")) {
                        // 透明度动画，不包括垂直移动
                        consoleObjDebug("Card fade-in", entry.target)
                        toggleElementClass(entry.target, "card-fade-in-start", true)
                    } else if (entry.target.classList.contains("content-card-slide-in")) {
                        // 内容卡片的滑入动画，包括透明度和垂直移动
                        consoleObjDebug("Content card slide-in", entry.target)
                        toggleElementClass(entry.target, "content-card-slide-in-start", true)
                    }
                }
            })
        }, {
            threshold: 0.0
        })
    }
    return interSectionObserver
}

// 元素进入窗口初次显示时添加动画，部分页面需要将 slide-in 替换为 fade-in，避免与其它动画冲突
function handleSlideIn(entry: IntersectionObserverEntry, slideInAnimationBaseClass: string, slideInAnimationStartClass: string) {
    if (entry.target.classList.contains("index-card") || entry.target.classList.contains("grid-index-card")) {
        // 线性索引 + 网格索引
        if (window.scrollY > 0) {
            // 用户滚动之后，使用滑入动画，更灵动
            consoleObjDebug("Card slide-in", entry.target)
            toggleElementClass(entry.target, slideInAnimationStartClass, true)
        } else {
            // 用户滚动之前，使用透明度动画，防止与顶部封面展开动画冲突
            consoleObjDebug("Card fade-in", entry.target)
            toggleElementClass(entry.target, "card-fade-in", true)
            toggleElementClass(entry.target, slideInAnimationBaseClass, false)
            toggleElementClass(entry.target, "card-fade-in-start", true)
        }
    } else {
        // 非索引元素，启动滑入动画
        consoleObjDebug("Card slide-in", entry.target)
        toggleElementClass(entry.target, slideInAnimationStartClass, true)
    }
}
