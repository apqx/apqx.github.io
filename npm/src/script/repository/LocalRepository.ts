export class LocalRepository {
    KEY_HANDWRITING_FONT = "handwritingFont"

    saveBoolean(key: string, value: boolean) {
        localStorage.setItem(key, String(value))
    }
    
    getBoolean(key: string): boolean {
        // 默认为false
        const value = localStorage.getItem(key)
        if (value === "true") {
            return true
        } else {
            return false
        }
    }

    saveHandwritingFontOn(on: boolean) {
        this.saveBoolean(this.KEY_HANDWRITING_FONT, on)
    }

    getHandWritingFontOn(): boolean {
        return this.getBoolean(this.KEY_HANDWRITING_FONT)
    }

}