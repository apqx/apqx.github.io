import { LocalDb } from "../../repository/LocalDb"
import { saveTheme, showThemeDark } from "../theme"
import { refreshTopbar, setFixedTopbar } from "../topbar"
import { setNotoSerifSCFont } from "../font/font"
import { consoleDebug } from "../../util/log"
import { BaseExternalStore } from "../base/BasExternalStore"

export interface PreferenceDialogState {
    fixedTopbarOn: boolean
    notoSerifSCFontOn: boolean
    autoThemeOn: boolean
}

export class PreferenceDialogPresenter extends BaseExternalStore {
    state = {
        fixedTopbarOn: false,
        notoSerifSCFontOn: false,
        autoThemeOn: false
    }

    localRepository: LocalDb = new LocalDb()
    darkClass: string = "dark"

    initSettings() {
        this.state = {
            fixedTopbarOn: this.localFixedTopbarOn(),
            notoSerifSCFontOn: this.localNotoSerifSCFontOn(),
            autoThemeOn: this.localAutoThemeOn()
        }
        this.emitChange()
        consoleDebug("PreferenceDialogPresenter initSettings, state = " + JSON.stringify(this.state))
    }
    
    onClickFixedTopbarSwitch = () => {
        const newStateOn = !this.state.fixedTopbarOn
        this.state.fixedTopbarOn = newStateOn
        this.emitChange()
        this.localRepository.saveFixedTopbarOn(newStateOn)
        refreshTopbar()
    }

    onClickNotoSerifSCFontSwitch = () => {
        const newStateOn = !this.state.notoSerifSCFontOn
        this.state.notoSerifSCFontOn = newStateOn
        this.emitChange()
        this.localRepository.saveNotoSerifSCFontOn(newStateOn)
        setNotoSerifSCFont(newStateOn)
    }

    onClickAutoThemeSwitch = () => {
        const newStateOn = !this.state.autoThemeOn
        this.state.autoThemeOn = newStateOn
        this.emitChange()
        const bodyE = document.body
        if (newStateOn) {
            // 启动了自适应主题，检测系统设置，更改当前主题
            const sysDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            const currentDarkTheme = bodyE.classList.contains(this.darkClass)
            if (currentDarkTheme != sysDarkTheme) {
                // 响应系统的主题修改，即变化主题
                showThemeDark(sysDarkTheme)
            }
            saveTheme(this.localRepository.VALUE_THEME_AUTO)
        } else {
            // 关闭了自适应主题，检测当前主题并保存
            const currentDarkTheme = bodyE.classList.contains(this.darkClass)
            if (currentDarkTheme) {
                saveTheme(this.localRepository.VALUE_THEME_DARK)
            } else {
                saveTheme(this.localRepository.VALUE_THEME_LIGHT)
            }
        }
    }

    localFixedTopbarOn(): boolean {
        return this.localRepository.getFixedTopbarOn()
    }

    localHandWritingFontOn(): boolean {
        return this.localRepository.getHandWritingFontOn()
    }

    localNotoSerifSCFontOn(): boolean {
        return this.localRepository.getNotoSerifSCFontOn()
    }

    localAutoThemeOn(): boolean {
        return this.localRepository.getAutoThemeOn()
    }
}
