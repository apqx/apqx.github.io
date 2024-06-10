import { ResizeWidthObserver } from "../../base/ResizeWidthObserver"
import { consoleDebug } from "../../util/log"
import { getElementAttribute } from "../../util/tools"

/**
 * 图片加载动画，需要自己添加transition属性和初始height，否则不会有动画
 */
export class ImageLoadAnimator {
    imgE: HTMLImageElement
    id: string
    widthResizeObserver: ResizeWidthObserver

    /**
     * 
     * @param imgE 目标图片元素
     * @param ratio 图片宽高比
     * @param monitorResize 是否监听宽度变化，动画调整高度，false会在加载完成后设置高度为auto，之后不会再有动画
     */
    constructor(imgE: HTMLImageElement, ratio: number = -1, monitorResize: boolean = false, animationEndCallback: () => void = null) {
        this.imgE = imgE
        this.id = getElementAttribute(imgE, "alt")

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
            // 动画完成后，设置高度为auto
            this.animationDone(monitorResize, imgE, animationEndCallback)
        })
        // 监听动画失败
        imgE.addEventListener("animationcancel", () => {
            consoleDebug("Image animationcancel " + this.id)
            this.animationDone(monitorResize, imgE, animationEndCallback)
        })
    }

    private animationDone(monitorResize: boolean, imgE: HTMLImageElement, animationEndCallback: () => void) {
        if (!monitorResize) {
            imgE.classList.remove("height-animation")
            imgE.style.height = "auto"
        }
        if (animationEndCallback != null) animationEndCallback()
    }

    setImageHeight(imgE: HTMLImageElement, ratio: number) {
        const height = imgE.width / ratio
        consoleDebug("SetImageHeight = " + height + ", " + this.id)
        imgE.style.height = height + "px"
        // 如果使用了`will-change`，要及时关闭
    }

    destroy() {
        if (this.widthResizeObserver != null) this.widthResizeObserver.destroy()
    }
}
