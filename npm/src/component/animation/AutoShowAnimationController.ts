import { consoleInfo } from "../../util/log";
import type { IAnimationController } from "./IAnimationController";
import type { IAutoShowAnimationController } from "./IAutoShowAnimationController";

export class AutoShowAnimationController implements IAutoShowAnimationController {
    private animationController: IAnimationController
    private intersectionObserver: IntersectionObserver | null = null
    private autoShow: boolean

    constructor(animationController: IAnimationController, autoShow: boolean) {
        this.animationController = animationController
        this.autoShow = autoShow
        if (this.autoShow) {
            this.startIntersectionObserve()
        }
    }

    getElement(): Element | null {
        return this.animationController.getElement()
    }

    resetIntersectionObserve(): void {
        this.stopIntersectionObserve()
        this.startIntersectionObserve()
    }
    
    private initIntersectionObserver() {
        if (this.intersectionObserver == null) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                const entry = entries.pop()
                if (entry == null) return
                if (entry.isIntersecting) {
                    consoleInfo(`AutoShowAnimationController intersection entry ${entry?.target.tagName} ${entry?.target.classList}`)
                    this.toggleOpen(true)
                    this.stopIntersectionObserve()
                }
            })
        }
    }
    
    private startIntersectionObserve() {
        const ele = this.animationController.getElement()
        if (ele) {
            this.initIntersectionObserver()
            this.intersectionObserver?.observe(ele)
        }
    }

    private stopIntersectionObserve() {
        const ele = this.animationController.getElement()
        if (ele) {
            this.intersectionObserver?.unobserve(ele)
        }
    }

    toggleOpen(open: boolean): void {
        this.animationController.toggleOpen(open)
    }

    destroy(): void {
        this.stopIntersectionObserve()
        this.animationController.destroy()
    }

}