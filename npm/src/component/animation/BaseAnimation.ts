import "./BaseAnimation.scss"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { toggleElementClass } from "../../util/tools"

var interSectionObserver: IntersectionObserver | null = null

export function getInterSectionObserver() {
    if (interSectionObserver == null) {
        // 创建一个新的 IntersectionObserver 实例
        interSectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                // 元素进入视口，触发动画
                if (entry.isIntersecting) {
                    // 判断元素是从下方进入还是上方进入，决定动画的方向
                    const slidFromBottom = entry.boundingClientRect.y > 0
                    if (containsSlideInClass(entry.target)) {
                        // consoleObjDebug("Content slide-in", entry.target)
                        handleSlideInBase(entry, slidFromBottom)
                    } else if (containsFadeInClass(entry.target)) {
                        // consoleObjDebug("Content fade-in", entry.target)
                        handleFadeIn(entry)
                    }
                    // 只触发一次动画，之后不再监听
                    getInterSectionObserver().unobserve(entry.target)
                }
            })
        }, {
            threshold: 0.0
        })
    }
    return interSectionObserver
}

const CHAINED_SLIDE_IN_INTERVAL = 50
let chainedSlideInQueue: Element[] = []
let chainedSlideInTimerId: number | null = null
let lastChainedSlideInStartTime = 0

export function queryAnimatedElement(rootE?: Element) {
    return rootE?.querySelector(".slide-in, .slide-in-offset, .slide-in-farer, .slide-in-farer-offset, .fade-in") as HTMLElement
}

const slideInClasses = ["slide-in", "slide-in-offset", "slide-in-farer", "slide-in-farer-offset"]

const fadeInClasses = ["fade-in"]

function containsSlideInClass(element: Element) {
    return slideInClasses.some(className => element.classList.contains(className))
}

function containsFadeInClass(element: Element) {
    return fadeInClasses.some(className => element.classList.contains(className))
}

function removeSlideInClasses(element: Element) {
    slideInClasses.forEach(className => {
        toggleElementClass(element, className, false)
    })
}

function removeFadeInClasses(element: Element) {
    fadeInClasses.forEach(className => {
        toggleElementClass(element, className, false)
    })
}

function startFadeIn(element: Element) {
    requestAnimationFrame(() => {
        toggleElementClass(element, "fade-in--start", true)
    })
}

function startSlideIn(element: Element, delay: number = 0) {
    let readyClass = ""
    let startClass = "slide-in--start"
    if (element.classList.contains("slide-in")) {
        readyClass = "slide-in--ready"
    } else if (element.classList.contains("slide-in-offset")) {
        readyClass = "slide-in-offset--ready"
    } else if (element.classList.contains("slide-in-farer")) {
        readyClass = "slide-in-farer--ready"
    } else if (element.classList.contains("slide-in-farer-offset")) {
        readyClass = "slide-in-farer-offset--ready"
    }
    if (readyClass) {
        toggleElementClass(element, readyClass, true)
        if (delay > 0) {
            setTimeout(() => {
                toggleElementClass(element, startClass, true)
            }, delay)
        } else {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toggleElementClass(element, startClass, true)
                })
            })
        }
    }
}

function enqueueChainedSlideIn(element: Element) {
    // 将元素加入链式动画队列，保持原有顺序
    chainedSlideInQueue.push(element)
    scheduleNextChainedSlideIn()
}

function scheduleNextChainedSlideIn() {
    // 非空表示一个动画正在等待启动，改动画启动时会自动触发这里继续安排后续动画
    // 非空表示正在被占用
    if (chainedSlideInTimerId != null) {
        return
    }

    const wait = Math.max(0, lastChainedSlideInStartTime + CHAINED_SLIDE_IN_INTERVAL - Date.now())
    chainedSlideInTimerId = window.setTimeout(() => {
        chainedSlideInTimerId = null

        let started = false
        // 从队列中取出下一个有效元素，启动动画
        while (chainedSlideInQueue.length > 0) {
            const candidate = chainedSlideInQueue.shift()
            if (candidate == null) {
                continue
            }
            const htmlElement = candidate as HTMLElement
            // 如果元素已卸载或者动画已启动，则跳过
            if (!htmlElement.isConnected || htmlElement.classList.contains("slide-in--start")) {
                continue
            }

            startSlideIn(candidate)
            lastChainedSlideInStartTime = Date.now()
            started = true
            break
        }
        // 没有动画启动，且队列已空，直接返回，不需要继续安排
        if (!started && chainedSlideInQueue.length === 0) {
            return
        }
        // 队列非空，继续安排下一个动画
        if (chainedSlideInQueue.length > 0) {
            // 继续安排后续动画
            scheduleNextChainedSlideIn()
        }
    }, wait)
}

function handleFadeIn(entry: IntersectionObserverEntry) {
    if (entry.target.classList.contains("scroll-to-slide-in") && window.scrollY > 0) {
        removeFadeInClasses(entry.target)
        toggleElementClass(entry.target, "slide-in", true)
        startSlideIn(entry.target)
    }
    toggleElementClass(entry.target, "fade-in--start", true)
}

function handleSlideInBase(entry: IntersectionObserverEntry, slidFromBottom: boolean) {
    if ((entry.target.classList.contains("scroll-to-fade-in") && window.scrollY > 0) || !slidFromBottom) {
        // 用户滚动之后，或者元素从上方进入，使用透明度动画
        removeSlideInClasses(entry.target)
        toggleElementClass(entry.target, "fade-in", true)
        startFadeIn(entry.target)
    } else {
        // 其余情况使用滑入动画
        const now = Date.now()
        consoleDebug("Handle slide-in, now = " + now + ", queue = " + chainedSlideInQueue.length)
        if (entry.target.classList.contains("slide-in-chained")) {
            // slide-in 动画链式启动，保持短间隔。如果元素已卸载则不会占用后续延迟
            enqueueChainedSlideIn(entry.target)
            return
        }

        startSlideIn(entry.target)

    }
}