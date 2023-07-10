import {PreferenceDialogContent} from "./PreferenceDialog";
import {LocalRepository} from "../repository/LocalRepository";
import {toggleClassWithEnable} from "../util/Tools";
import { saveTheme, toggleTheme } from "../util/ThemeUtils";
import { masonry } from "../main";

export class PreferenceDialogPresenter {

    component: PreferenceDialogContent = null
    localRepository: LocalRepository = new LocalRepository()
    darkClass: string = "dark"
    handwritingClass: string = "handwriting"

    constructor(component: PreferenceDialogContent) {
        this.component = component
    }

    initSettings() {
        this.component.setState({
            handwritingFontOn: this.localHandWritingFontOn(),
            autoThemeOn: this.localAutoThemeOn()
        })
    }

    onClickHandwritingFontSwitch(on: boolean) {
        this.localRepository.saveHandwritingFontOn(on)
        const bodyE = document.getElementsByTagName("body")[0]
        toggleClassWithEnable(bodyE, this.handwritingClass, on)
        masonry.layout()
    }

    onClickAutoThemeSwitch(on: boolean) {
        const bodyE = document.getElementsByTagName("body")[0];
        if (on) {
            // 启动了自适应主题，检测系统设置，更改当前主题
            const sysDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            const currentDarkTheme = bodyE.classList.contains(this.darkClass)
            if (currentDarkTheme != sysDarkTheme) {
                // 响应系统的主题修改，即变化主题
                toggleTheme(false)
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

    localHandWritingFontOn(): boolean {
        return this.localRepository.getHandWritingFontOn()
    }

    localAutoThemeOn(): boolean {
        return this.localRepository.getAutoThemeOn()
    }
}