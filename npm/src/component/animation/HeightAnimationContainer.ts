import "./HeightAnimationContainer.scss"
import { ResizeWidthObserver } from "../../base/ResizeWidthObserver"
import { consoleDebug } from "../../util/log"
import { getElementSize } from "../../util/tools"

/**
 * 为容器添加高度动画，必须只有一个子元素
 */
export class HeightAnimationContainer {
    containerE: HTMLElement
    contentE: HTMLElement
    lastHeight: number
    resizeWidthObserver: ResizeWidthObserver | null = null

    constructor(animationContainerE: HTMLElement) {
        this.containerE = animationContainerE
        this.lastHeight = -1
        // 这里可以先计算一次高度
        this.update(false)
        // 监听子元素尺寸变化
        this.contentE = this.containerE.firstChild as HTMLElement
        if (this.contentE != null) {
            // 监听子元素宽度变化，计算高度，启动动画过渡
            this.resizeWidthObserver = new ResizeWidthObserver(this.contentE, (width: number) => {
                this.update()
            })
        }
    }

    destroy() {
        if (this.resizeWidthObserver != null) this.resizeWidthObserver.destroy()
    }

    update(_animation: boolean = true, _targetHeight: number = -1, _duration: number = -1) {
        let targetHeight = 0
        // 根据尺寸变化定义先定义不同的动画时间，记录上一次的尺寸，进行对比
        // 检查尺寸变化比较小的情况，赋予一个短动画时间，线性变化，参考tag
        // 10篇博文，0.2s，高度750px
        if (_targetHeight >= 0) {
            targetHeight = _targetHeight
            consoleDebug("HeightAnimationContainer use given height + " + targetHeight)
            const marginTop = getElementSize(this.contentE, "margin-top")
            targetHeight += marginTop
            consoleDebug("HeightAnimationContainer + child marginTop " + marginTop + " = " + targetHeight)
            const marginBottom = getElementSize(this.contentE, "margin-bottom")
            targetHeight += marginBottom
            consoleDebug("HeightAnimationContainer + child marginBottom " + marginBottom + " = " + targetHeight)
        } else {
            targetHeight = this.calcHeight(this.containerE)
        }
        if (_animation) {
            this.containerE.style.transitionProperty = "height"
        } else {
            this.containerE.style.transitionProperty = "none"
        }
        if (this.lastHeight == -1) {
            this.lastHeight = 0
        }
        let duration = this.calcDuration(targetHeight, this.lastHeight, _duration)
        this.containerE.style.transitionDuration = duration + "s"
        this.containerE.style.height = targetHeight + "px"
        this.lastHeight = targetHeight
        consoleDebug("HeightAnimationContainer set height = " + targetHeight + ", duration = " + duration)
    }

    private calcHeight(containerE: HTMLElement): number {
        let height = 0
        for (let i = 0; i < containerE.children.length; i++) {
            const childE = containerE.children[i] as HTMLElement
            height += childE.offsetHeight
            consoleDebug("HeightAnimationContainer + child height = " + childE.offsetHeight)
            const first = i == 0
            const last = i == containerE.childElementCount - 1
            if (first) {
                const marginTop = getElementSize(childE, "margin-top")
                height += marginTop
                consoleDebug("HeightAnimationContainer + child marginTop = " + marginTop)
            }
            const marginBottom = getElementSize(childE, "margin-bottom")
            if (last) {
                height += marginBottom
                consoleDebug("HeightAnimationContainer + child marginBottom = " + marginBottom)
            } else {
                const nextMarginTop = getElementSize(containerE.children[i + 1] as HTMLElement, "margin-top")
                const margin = Math.max(marginBottom, nextMarginTop)
                height += margin
                consoleDebug("HeightAnimationContainer + child margin = " + margin)
            }
        }
        // 实际尺寸差几个像素，overflow设为hidden，导致border被挡住一部分
        if (containerE.childElementCount > 0)
            height += 2
        return height
    }

    /**
     * 计算动画时间
     * @param height 新尺寸
     * @param lastHeight 旧尺寸
     * @param _duration 用户传入的动画时间
     * @returns 
     */
    private calcDuration(height: number, lastHeight: number, _duration: number) {
        const animationSize = Math.abs(height - lastHeight)
        let duration = 0
        if (_duration >= 0) {
            duration = _duration
            consoleDebug("HeightAnimationContainer use given duration + " + duration + "s")
        } else {
            duration = animationSize / 1800
            consoleDebug("HeightAnimationContainer child total height = " + height + ", lastHeight = " + lastHeight +
                ", animationSize = " + animationSize + ", duration = " + duration + "s")
            if (duration < 0.3) {
                duration = 0.3
                consoleDebug("Actual duration = " + duration + "s")
            }
            if (duration > 0.5) {
                duration = 0.5
                consoleDebug("Actual duration = " + duration + "s")
            }
        }
        return duration
    }

    setHeightAuto() {
        this.containerE.style.height = "auto"
    }
}