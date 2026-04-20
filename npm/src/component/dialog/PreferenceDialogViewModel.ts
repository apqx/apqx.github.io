import { LocalDb } from "../../repository/LocalDb"
import { saveTheme, showThemeDark } from "../theme"
import { checkTopbar } from "../topbar"
import { setNotoSerifSCFont } from "../font/font"
import { consoleInfo } from "../../util/log"
import { BaseExternalStore } from "../base/paginate/BaseExternalStore"
import { checkScrimBlur } from "../scrim"
import { getEventEmitter } from "../base/EventBus"

export interface PreferenceDialogState {
    fixedTopbarOn: boolean
    notoSerifSCFontOn: boolean
    autoThemeOn: boolean
}

export class PreferenceDialogViewModel extends BaseExternalStore {
    state = {
        fixedTopbar: false,
        notoSerifSCFont: false,
        lensBiggerPicture: false,
        scrimBlur: false,
        autoTheme: false
    }

    localRepository: LocalDb = new LocalDb()
    darkClass: string = "dark"


    initSettings() {
        this.state = {
            fixedTopbar: this.localFixedTopbar(),
            notoSerifSCFont: this.localNotoSerifSCFont(),
            lensBiggerPicture: this.localLensBiggerPicture(),
            scrimBlur: this.localScrimBlur(),
            autoTheme: this.localAutoTheme()
        }
        this.emitChange()
        consoleInfo("PreferenceDialogViewModel initSettings, state = " + JSON.stringify(this.state))
    }

    onClickFixedTopbarSwitch = () => {
        const newState = !this.state.fixedTopbar
        this.state = { ...this.state, fixedTopbar: newState }
        this.emitChange()
        this.localRepository.saveFixedTopbar(newState)
        checkTopbar()
    }

    onClickNotoSerifSCFontSwitch = () => {
        const newState = !this.state.notoSerifSCFont
        this.state = { ...this.state, notoSerifSCFont: newState }
        this.emitChange()
        this.localRepository.saveNotoSerifSCFont(newState)
        setNotoSerifSCFont(newState)
    }

    onClickScrimBlurSwitch = () => {
        const newState = !this.state.scrimBlur
        this.state = { ...this.state, scrimBlur: newState }
        this.emitChange()
        this.localRepository.saveScrimBlur(newState)
        checkScrimBlur()
    }

    onClickLensBiggerPictureSwitch = () => {
        const newState = !this.state.lensBiggerPicture
        this.state = { ...this.state, lensBiggerPicture: newState }
        this.emitChange()
        this.localRepository.saveLensBiggerPicture(newState)
        // 通知透镜组件刷新布局
        const emitter = getEventEmitter()
        emitter.emit("lensBiggerPictureChange", {
            enabled: newState
        })
    }

    onClickAutoThemeSwitch = () => {
        const newState = !this.state.autoTheme
        this.state = { ...this.state, autoTheme: newState }
        this.emitChange()
        const bodyE = document.body
        if (newState) {
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

    localFixedTopbar(): boolean {
        return this.localRepository.getFixedTopbar()
    }

    localHandWritingFontOn(): boolean {
        return this.localRepository.getHandWritingFont()
    }

    localLensBiggerPicture(): boolean {
        return this.localRepository.getLensBiggerPicture()
    }

    localNotoSerifSCFont(): boolean {
        return this.localRepository.getNotoSerifSCFont()
    }

    localScrimBlur(): boolean {
        return this.localRepository.getScrimBlur()
    }

    localAutoTheme(): boolean {
        return this.localRepository.getAutoTheme()
    }
}
