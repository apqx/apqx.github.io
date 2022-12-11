import {PreferenceDialogContent} from "./PreferenceDialog";
import {LocalRepository} from "../repository/LocalRepository";
import {toggleClassWithEnable} from "../util/Tools";

export class PreferenceDialogPresenter {
    component: PreferenceDialogContent = null
    localRepository: LocalRepository = new LocalRepository()

    constructor(component: PreferenceDialogContent) {
        this.component = component
    }

    loadHandwritingFontSetting() {
        const localHandWritingFontOn = this.localRepository.getHandWritingFontOn()
        this.component.setState({
            handwritingFontOn: localHandWritingFontOn
        })
        // this.component.handwritingFontSwitch.selected = localHandWritingFontOn
    }

    onClickHandwritingFontSwitch(on: boolean) {
        this.localRepository.saveHandwritingFontOn(on)
        const bodyE = document.getElementsByTagName("body")[0];
        toggleClassWithEnable(bodyE, "handwriting", on)
    }
}