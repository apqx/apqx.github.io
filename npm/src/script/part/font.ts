import { localRepository } from "../repository/LocalRepository";
import { toggleClassWithEnable } from "../util/Tools";

export function initHandwritingFont() {
    const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    setHandwrittenFont(localHandWritingFontOn)
}

export function setHandwrittenFont(on: boolean) {
    const bodyE = document.querySelector("body");
    toggleClassWithEnable(bodyE, "handwritten", on)
}