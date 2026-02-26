import "./ProgressLinear.scss"
import React, { useEffect } from "react"
import { MDCLinearProgress } from "@material/linear-progress"

interface Props {
    loading: boolean
    classes?: string[]
}

export function ProgressLinear(props: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const progressLinear = React.useRef<MDCLinearProgress>(null)

    useEffect(() => {
        const ele = containerRef.current as Element
        progressLinear.current = new MDCLinearProgress(ele)
        return () => {
            progressLinear.current?.destroy()
        }
    }, [])

    useEffect(() => {
        if (props.loading) {
            progressLinear.current!!.determinate = false
            progressLinear.current?.open()
        } else {
            progressLinear.current!!.determinate = false
            progressLinear.current?.close()
        }
    }, [props.loading])


    return (
        <div ref={containerRef} role="progressbar" className={`mdc-linear-progress ${props.classes?.join(" ") ?? ""}`.trimEnd()}>
            <div className="mdc-linear-progress__buffer">
                <div className="mdc-linear-progress__buffer-bar"></div>
                <div className="mdc-linear-progress__buffer-dots"></div>
            </div>
            <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                <span className="mdc-linear-progress__bar-inner"></span>
            </div>
            <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                <span className="mdc-linear-progress__bar-inner"></span>
            </div>
        </div>
    )
}
