export class DelayToTimeGap {
    private timeoutId: NodeJS.Timeout | null = null
    private delayGap: number

    constructor(delayGap: number = 300) {
        this.delayGap = delayGap
    }

    delay(callback: () => void) {
        this.cancelPendingAction()
        this.timeoutId = setTimeout(() => {
            callback()
        }, this.delayGap)
    }

    cancelPendingAction() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }
    }
}