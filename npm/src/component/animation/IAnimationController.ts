// TODO: 动画监听
export enum AnimEvent {
    Opening = "opening",
    Open = "open",
    closing = "closing",
    close = "close",
}

export interface IAnimationController {
    toggleOpen(open: boolean): void

    getElement(): Element | null
    
    isOpened(): boolean

    destroy(): void
}