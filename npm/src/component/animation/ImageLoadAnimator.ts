import { ResizeWidthObserver } from "../../base/ResizeWidthObserver"
import { consoleDebug } from "../../util/log"
import { getElementAttribute, toggleClassWithEnable } from "../../util/tools"

/**
 * 图片加载动画，需要自己添加 transition 属性和初始 height，否则不会有动画
 */
export class ImageLoadAnimator {
    imgE: HTMLImageElement
    id: string | null
    widthResizeObserver: ResizeWidthObserver | null = null
    animationBeforeStart: (() => boolean) | null = null

    /**
     * 为图片加载添加高度变化动画
     * @param imgE 目标图片元素
     * @param ratio 图片宽高比
     * @param monitorResize 是否监听宽度变化，动画调整高度，false会在加载完成后设置高度为auto，之后不会再有动画
     * @param [animationBeforeStart=null] 动画开始前的回调函数，返回true表示继续执行动画，false表示不执行动画
     * @param [animationEndCallback=null] 动画结束后的回调函数
     */
    constructor(imgE: HTMLImageElement, ratio: number = -1, monitorResize: boolean = false, animationBeforeStart: (() => boolean) | null = null, animationEndCallback: (() => void) | null = null) {
        this.imgE = imgE
        this.id = getElementAttribute(imgE, "alt")
        this.animationBeforeStart = animationBeforeStart

        // 图片有可能已经加载、显示完成
        if (imgE.complete) {
            consoleDebug("Image complete " + this.id + ", " +
                imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
            if (ratio == -1) {
                ratio = imgE.naturalWidth / imgE.naturalHeight
            }
            this.setImageHeight(imgE, ratio)
        } else {
            // 如何获取图片的原始尺寸
            // 懒加载完成监听
            imgE.onload = () => {
                consoleDebug("Image onload " + this.id + ", " +
                    imgE.width + " : " + imgE.height + ", " + imgE.naturalWidth + " : " + imgE.naturalHeight)
                // 浏览器下载完成，尚未显示出来，尺寸height已经计算出来了
                if (ratio == -1) {
                    ratio = imgE.naturalWidth / imgE.naturalHeight
                }
                this.setImageHeight(imgE, ratio)
                imgE.onerror = () => {
                    if (ratio != -1)
                        this.setImageHeight(imgE, ratio)
                }
            }
        }
        if (monitorResize) {
            this.widthResizeObserver = new ResizeWidthObserver(imgE, (width) => {
                consoleDebug("Image widthResizeObserver " + this.id + ", width = " + width)
                if (ratio == -1) {
                    ratio = imgE.naturalWidth / imgE.naturalHeight
                }
                this.setImageHeight(imgE, ratio)
            })
        }
        imgE.addEventListener("transitionend", () => {
            consoleDebug("Image transitionend " + this.id)
            // 动画完成后，删除动画类，设置高度为auto
            this.animationDone(monitorResize, imgE, animationEndCallback)
        })
        // 监听动画失败
        imgE.addEventListener("animationcancel", () => {
            consoleDebug("Image animationcancel " + this.id)
            this.animationDone(monitorResize, imgE, animationEndCallback)
        })
    }

    private animationDone(monitorResize: boolean, imgE: HTMLImageElement, animationEndCallback: (() => void) | null) {
        if (!monitorResize) {
            toggleClassWithEnable(imgE, "image-height-animation", false)
            imgE.style.height = "auto"
        }
        if (animationEndCallback != null) animationEndCallback()
    }

    setImageHeight(imgE: HTMLImageElement, ratio: number) {
        // 检查是否需要执行动画
        if (this.animationBeforeStart != null && !this.animationBeforeStart()) {
            consoleDebug("ImageLoadAnimator animationBeforeStart returned false, not animating " + this.id)
            // 删除动画类，Img高度自动变为图片实际高度
            toggleClassWithEnable(imgE, "image-height-animation", false)
            imgE.style.height = "auto"
            return
        }

        const height = imgE.width / ratio
        consoleDebug("SetImageHeight = " + height + ", " + this.id)
        imgE.style.height = height + "px"
        // 如果使用了`will-change`，要及时关闭
    }

    destroy() {
        if (this.widthResizeObserver != null) this.widthResizeObserver.destroy()
    }
}
