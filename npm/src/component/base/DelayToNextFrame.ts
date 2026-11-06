export class DelayToNextFrame {
    private frameId: number | null = null

    delay(callback: () => void) {
        this.cancelPendingFrame()
        this.frameId = requestAnimationFrame(() => {
            this.frameId = requestAnimationFrame(() => {
                callback()
            })
        })
    }

    cancelPendingFrame() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId)
        }
    }
}