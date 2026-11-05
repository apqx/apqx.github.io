export interface IAnimationController {
    toggleOpen(open: boolean): void

    getElement(): Element | null

    destroy(): void
}