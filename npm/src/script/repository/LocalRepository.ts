export class LocalRepository {

    KEY_HANDWRITTEN_FONT = "handwrittenFont"
    KEY_THEME = "theme"

    VALUE_THEME_DARK = "dark"
    VALUE_THEME_LIGHT = "light"
    VALUE_THEME_AUTO = "auto"

    saveBoolean(key: string, value: boolean) {
        this.saveString(key, String(value))
    }
    
    getBoolean(key: string): boolean {
        // 默认为false
        const value = this.getString(key)
        if (value === "true") {
            return true
        } else {
            return false
        }
    }

    saveString(key: string, value: string) {
        localStorage.setItem(key, value)
    }

    getString(key: string): string {
        return localStorage.getItem(key)
    }

    saveHandwritingFontOn(on: boolean) {
        this.saveBoolean(this.KEY_HANDWRITTEN_FONT, on)
    }

    getHandWritingFontOn(): boolean {
        return this.getBoolean(this.KEY_HANDWRITTEN_FONT)
    }

    getTheme(): string {
        return this.getString(this.KEY_THEME)
    }

    setTheme(theme: string) {
        this.saveString(this.KEY_THEME, theme)
    }

    getAutoThemeOn(): boolean {
        return this.getTheme() === this.VALUE_THEME_AUTO
    }

}