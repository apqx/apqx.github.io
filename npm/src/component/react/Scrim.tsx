import "./Scrim.scss"
import { useEffect, useRef } from "react"
import { toggleFade } from "../animation/BaseAnimation"
import { consoleInfo } from "../../util/log"

export interface ScrimController {
    open: () => void
    close: () => void
}

interface ScrimProps {
    controllerRef: React.RefObject<ScrimController | null>
}

export function Scrim(props: ScrimProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        props.controllerRef.current = {
            open: () => {
                consoleInfo("Scrim open")
                toggleFade(containerRef.current as HTMLElement, true)
            },
            close: () => {
                consoleInfo("Scrim close")
                toggleFade(containerRef.current as HTMLElement, false)
            }
        }
    }, [props.controllerRef])

    return (
        <div ref={containerRef} className="common-scrim fade"></div>
    )

}