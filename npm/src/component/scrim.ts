import "./scrim.scss"
import { consoleInfo, consoleError } from "../util/log"
import { toggleFade } from "./animation/BaseAnimation"

var scrimE: HTMLElement | null = null


export function initScrim() {
    scrimE = document.querySelector(".common-scrim") as HTMLElement
    if (scrimE == null) {
        consoleError("Scrim element not found")
        return
    }
}

export function toggleScrimActive(on: boolean) {
    consoleInfo("Toggle scrim active " + on)
    if (scrimE == null) return
    toggleFade(scrimE, on)
}