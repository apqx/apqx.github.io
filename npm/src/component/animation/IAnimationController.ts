export interface IAnimationController {
    toggleOpen(open: boolean): void

    getElement(): Element | null

    isOpened(): boolean

    destroy(): void
}