import "./scrim.scss"
import { consoleInfo, consoleError } from "../util/log"
import { toggleElementClass } from "../util/tools"

var scrimE: HTMLElement | null = null
var showRafId: number | null = null

function cancelPendingShowFrame() {
    if (showRafId != null) {
        cancelAnimationFrame(showRafId)
        showRafId = null
    }
}

export function initScrim() {
    scrimE = document.querySelector(".common-scrim") as HTMLElement
    if (scrimE == null) {
        consoleError("Scrim element not found")
        return
    }
    scrimE.addEventListener("transitionstart", (event: TransitionEvent) => {
        if (event.target !== scrimE || event.propertyName !== "opacity") return
    })
    scrimE.addEventListener("transitionend", (event: TransitionEvent) => {
        if (event.target !== scrimE || event.propertyName !== "opacity") return
        if (scrimE == null) return
        if (scrimE.classList.contains("common-scrim--active")) {
            toggleElementClass(scrimE, "common-scrim--visible", true)
        } else {
            toggleElementClass(scrimE, "common-scrim--visible", false)
        }
    })
    scrimE.addEventListener("transitioncancel", (event: TransitionEvent) => {
        if (event.target !== scrimE || event.propertyName !== "opacity") return
        if (scrimE == null) return
        if (!scrimE.classList.contains("common-scrim--active")) {
            toggleElementClass(scrimE, "common-scrim--visible", false)
        }
    })
}

export function toggleScrimActive(on: boolean) {
    consoleInfo("Toggle scrim active " + on)
    if (scrimE == null) return
    cancelPendingShowFrame()
    if (on) {
        toggleElementClass(scrimE, "common-scrim--visible", true)
        showRafId = requestAnimationFrame(() => {
            showRafId = null
            if (scrimE == null) return
            toggleElementClass(scrimE, "common-scrim--active", true)
        })
    } else {
        toggleElementClass(scrimE, "common-scrim--active", false)
    }
}