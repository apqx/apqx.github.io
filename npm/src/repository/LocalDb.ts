export class LocalDb {
    KEY_FIXED_TOPBAR = "fixedTopbar"
    KEY_HANDWRITTEN_FONT = "handwrittenFont"
    KEY_NOTO_SERIF_SC_FONT = "notoSerifSCFont"
    KEY_THEME = "theme"

    VALUE_THEME_DARK = "dark"
    VALUE_THEME_LIGHT = "light"
    VALUE_THEME_AUTO = "auto"

    saveBoolean(key: string, value: boolean) {
        this.saveString(key, String(value))
    }
    
    getBoolean(key: string): boolean | null {
        // 默认为false
        const value = this.getString(key)
        if (value == null || value == "") return null
        return value === "true";
    }

    saveString(key: string, value: string) {
        localStorage.setItem(key, value)
    }

    getString(key: string): string | null {
        return localStorage.getItem(key)
    }

    saveFixedTopbarOn(on: boolean) {
        this.saveBoolean(this.KEY_FIXED_TOPBAR, on)
    }

    getFixedTopbarOn(): boolean {
        return this.getBoolean(this.KEY_FIXED_TOPBAR) ?? false
    }

    saveHandwritingFontOn(on: boolean) {
        this.saveBoolean(this.KEY_HANDWRITTEN_FONT, on)
    }

    getHandWritingFontOn(): boolean {
        return this.getBoolean(this.KEY_HANDWRITTEN_FONT) ?? false
    }

    saveNotoSerifSCFontOn(on: boolean) {
        this.saveBoolean(this.KEY_NOTO_SERIF_SC_FONT, on)
    }

    /**
     * 获取思源宋体设置，默认开启
     */
    getNotoSerifSCFontOn(): boolean {
        return this.getBoolean(this.KEY_NOTO_SERIF_SC_FONT) ?? false
    }

    getTheme(): string {
        return this.getString(this.KEY_THEME) ?? this.VALUE_THEME_AUTO
    }

    setTheme(theme: string) {
        this.saveString(this.KEY_THEME, theme)
    }

    getAutoThemeOn(): boolean {
        return this.getTheme() === this.VALUE_THEME_AUTO
    }
}

var localRepository: LocalDb | undefined

export function initLocalRepository() {
    localRepository = new LocalDb()
}

export function getLocalRepository(): LocalDb {
    if (localRepository == null) {
        initLocalRepository()
    }
    return localRepository!!
}