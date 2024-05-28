import { consoleDebug } from "../../util/log"

export class HeightAnimationContainer {
    containers: Array<HTMLElement>
    lastHeightMap: Map<HTMLElement, number>
    constructor(rootE: Element) {
        this.containers = Array.from(rootE.querySelectorAll(".height-animation-container"))
        this.lastHeightMap = new Map()
    }

    update(_animation: boolean = true, _size: number = -1, _duration: number = -1) {
        this.containers.forEach(e => {
            let height = 0
            // TODO：目前只计算item的content+padding，不包括margin
            // 也可以再前套一层div
            // TODO:根据尺寸变化定义先定义不同的动画时间，记录上一次的尺寸，进行对比
            // 检查尺寸变化比较小的情况，赋予一个短动画时间，线性变化，参考tag
            // 10篇博文，0.2s，高度750px
            if (_size >= 0) {
                height = _size
                consoleDebug("HeightAnimationContainer use given height + " + height)
            } else {
                for (const node of e.childNodes) {
                    const e = node as HTMLElement
                    height += e.offsetHeight
                    consoleDebug("HeightAnimationContainer child height + " + e.offsetHeight)
                }
                // 实际尺寸差几个像素，overflow设为hidden，导致border被挡住一部分
                height += 2
            }
            if (_animation) {
                e.style.transitionProperty = "height"
            } else {
                e.style.transitionProperty = "none"
            }
            let lastHeight = this.lastHeightMap.get(e)
            if (lastHeight == null) {
                lastHeight = 0
            }
            const animationSize = Math.abs(height - lastHeight)
            let duration = 0
            if (_duration >= 0) {
                duration = _duration
                consoleDebug("HeightAnimationContainer use given duration + " + duration + "s")
            } else {
                duration = animationSize * 0.2 / 740
                consoleDebug("HeightAnimationContainer child height = " + height + " : " + lastHeight +
                    ", animationSize = " + animationSize + ", duration = " + duration + "s")
                if (duration < 0.1) {
                    duration = 0.1
                    consoleDebug("Actual duration = " + duration + "s")
                }
                if (duration > 0.3) {
                    duration = 0.3
                    consoleDebug("Actual duration = " + duration + "s")
                }
            }
            e.style.transitionDuration = duration + "s"
            e.style.height = height + "px"
            this.lastHeightMap.set(e, height)
        })
    }

}