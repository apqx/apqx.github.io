import { PreferenceDialog } from "./PreferenceDialog"
import { LocalDb } from "../../repository/LocalDb"
import { saveTheme, showThemeDark } from "../theme"
import { refreshTopbar, setFixedTopbar } from "../topbar"
import { setHandwrittenFont, setNotoSerifSCFont } from "../font/font"
import { consoleDebug } from "../../util/log"

export class PreferenceDialogPresenter {

    component: PreferenceDialog
    localRepository: LocalDb = new LocalDb()
    darkClass: string = "dark"

    constructor(component: PreferenceDialog) {
        this.component = component
    }

    initSettings() {
        this.component?.setState({
            fixedTopbarOn: this.localFixedTopbarOn(),
            handwrittenFontOn: this.localHandWritingFontOn(),
            notoSerifSCFontOn: this.localNotoSerifSCFontOn(),
            autoThemeOn: this.localAutoThemeOn()
        })
        consoleDebug("PreferenceDialogPresenter initSettings, state = " + JSON.stringify(this.component.state))
    }
    onClickFixedTopbarSwitch(on: boolean) {
        this.localRepository.saveFixedTopbarOn(on)
        setFixedTopbar(on)
        setTimeout(() => {
            refreshTopbar()
        }, 500)
    }

    onClickHandwritingFontSwitch(on: boolean) {
        this.localRepository.saveHandwritingFontOn(on)
        setHandwrittenFont(on)
    }

    onClickNotoSerifSCFontSwitch(on: boolean) {
        this.localRepository.saveNotoSerifSCFontOn(on)
        setNotoSerifSCFont(on)
    }

    onClickAutoThemeSwitch(on: boolean) {
        const bodyE = document.body
        if (on) {
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
