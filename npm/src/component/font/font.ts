import {localRepository} from "../../repository/LocalRepository"
import {toggleClassWithEnable} from "../../util/tools"
import {consoleError} from "../../util/log"

export function initHandwritingFont() {
    const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    setHandwrittenFont(localHandWritingFontOn)
}

export function setHandwrittenFont(on: boolean) {
    const bodyE = document.querySelector("body");
    toggleClassWithEnable(bodyE, "handwritten", on)
    if (!on) return
    // 按需加载手写字体
    import("./fontHandwritten").then().catch((e) => {
        consoleError(e)
    })
}
