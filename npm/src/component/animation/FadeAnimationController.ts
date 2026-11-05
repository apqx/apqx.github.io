import { AnimationController } from "./AnimationController";
import type { IAnimationController } from "./IAnimationController";

export class FadeAnimationController implements IAnimationController {
    private animationController: IAnimationController

    constructor(element: HTMLElement) {
        this.animationController = new AnimationController(element, "fade")
    }

    getElement(): Element | null {
        return this.animationController.getElement()
    }

    toggleOpen(open: boolean): void {
        this.animationController.toggleOpen(open)
    }

    destroy(): void {
        this.animationController.destroy()
    }

}