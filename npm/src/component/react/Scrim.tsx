import "./Scrim.scss"
import { useEffect, useRef } from "react"
import { consoleInfo } from "../../util/log"
import { FadeAnimationController } from "../animation/FadeAnimationController"

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
        const fadeAnimationController = new FadeAnimationController(containerRef.current!)
        props.controllerRef.current = {
            open: () => {
                consoleInfo("Scrim open")
                fadeAnimationController.toggleOpen(true)
            },
            close: () => {
                consoleInfo("Scrim close")
                fadeAnimationController.toggleOpen(false)
            }
        }
        return () => {
            fadeAnimationController.destroy()
            props.controllerRef.current = null
        }
    }, [props.controllerRef])

    return (
        <div ref={containerRef} className="common-scrim fade"></div>
    )

}