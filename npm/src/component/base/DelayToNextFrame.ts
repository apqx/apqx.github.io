export class DelayToNextFrame {
    private frameId: number | null = null

    delay(callback: () => void) {
        this.cancelPendingAction()
        this.frameId = requestAnimationFrame(() => {
            this.frameId = requestAnimationFrame(() => {
                callback()
            })
        })
    }

    cancelPendingAction() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId)
        }
    }
}