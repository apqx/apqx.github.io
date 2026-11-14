import { LocalDb } from "../../repository/LocalDb"
import { consoleInfo } from "../../util/log"
import { BaseExternalStore } from "../base/paginate/BaseExternalStore"
import { getEventEmitter } from "../base/EventBus"
import type { MdSwitch } from "@material/web/switch/switch"

export interface PreferenceDialogState {
    fixedTopbar: boolean
    notoSerifSCFont: boolean
    lensBiggerPicture: boolean
    autoTheme: boolean
    themeExpressive: boolean
    hideStatusBarBg: boolean
}

export class PreferenceDialogViewModel extends BaseExternalStore {
    state: PreferenceDialogState = {
        fixedTopbar: false,
        notoSerifSCFont: false,
        lensBiggerPicture: false,
        autoTheme: false,
        themeExpressive: false,
        hideStatusBarBg: false
    }

    localRepository: LocalDb = new LocalDb()
    darkClass: string = "dark"


    initSettings() {
        this.state = {
            fixedTopbar: this.localFixedTopbar(),
            notoSerifSCFont: this.localNotoSerifSCFont(),
            lensBiggerPicture: this.localLensBiggerPicture(),
            autoTheme: this.localAutoTheme(),
            themeExpressive: this.localThemeExpressive(),
            hideStatusBarBg: this.localHideStatusBarBg()
        }
        this.emitChange()
        consoleInfo("PreferenceDialogViewModel initSettings, state = " + JSON.stringify(this.state))
    }

    onClickFixedTopbarSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, fixedTopbar: newState }
        this.emitChange()
        this.localRepository.saveFixedTopbar(newState)
        getEventEmitter().emit("applyTopbarFixedChange", {
            fixed: newState
        })
    }

    onClickNotoSerifSCFontSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, notoSerifSCFont: newState }
        this.emitChange()
        this.localRepository.saveNotoSerifSCFont(newState)
        getEventEmitter().emit("applyFontChange", {
            notoSerifSCFont: newState
        })
    }

    onClickLensBiggerPictureSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, lensBiggerPicture: newState }
        this.emitChange()
        this.localRepository.saveLensBiggerPicture(newState)
        // 通知透镜组件刷新布局
        getEventEmitter().emit("applyLensBiggerPictureChange", {
            enabled: newState
        })
    }

    onClickHideStatusBarBgSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, hideStatusBarBg: newState }
        this.emitChange()
        this.localRepository.saveHideStatusBarBg(newState)
        // 通知状态栏组件刷新布局
        getEventEmitter().emit("applyStatusBarBgChange", {
            enabled: newState
        })
    }

    onClickAutoThemeSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, autoTheme: newState }
        this.emitChange()
        const bodyE = document.body
        let newTheme = this.localRepository.VALUE_THEME_AUTO
        if (!newState) {
            // 关闭了自适应主题，检测当前主题并保存
            const currentDarkTheme = bodyE.classList.contains(this.darkClass)
            if (currentDarkTheme) {
                newTheme = this.localRepository.VALUE_THEME_DARK
            } else {
                newTheme = this.localRepository.VALUE_THEME_LIGHT
            }
        }
        this.localRepository.saveTheme(newTheme)
        getEventEmitter().emit("applyNewTheme", {
            theme: newTheme,
            showToast: false
        })
    }

    onClickThemeExpressiveSwitch = (event: Event) => {
        const switchE = event.target as MdSwitch
        const newState = switchE.selected
        this.state = { ...this.state, themeExpressive: newState }
        this.emitChange()
        this.localRepository.saveThemeExpressive(newState)
        getEventEmitter().emit("applyNewTheme", {
            theme: null,
            showToast: false
        })
    }

    localFixedTopbar(): boolean {
        return this.localRepository.getFixedTopbar()
    }

    localHandwritingFont(): boolean {
        return this.localRepository.getHandWritingFont()
    }

    localLensBiggerPicture(): boolean {
        return this.localRepository.getLensBiggerPicture()
    }

    localNotoSerifSCFont(): boolean {
        return this.localRepository.getNotoSerifSCFont()
    }

    localAutoTheme(): boolean {
        return this.localRepository.getAutoTheme()
    }

    localThemeExpressive(): boolean {
        return this.localRepository.getThemeExpressive()
    }

    localHideStatusBarBg(): boolean {
        return this.localRepository.getHideStatusBarBg()
    }
}
