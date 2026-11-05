import type { IAnimationController } from "./IAnimationController";

export interface IAutoShowAnimationController extends IAnimationController {
    resetIntersectionObserve(): void
}