import "./ProgressLinear.scss"
import React, { useEffect } from "react"
import { MDCLinearProgress } from "@material/linear-progress"

interface Props {
    loading: boolean
}

export function ProgressLinear(props: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const progressLinear = React.useRef<MDCLinearProgress>(null)

    useEffect(() => {
        const ele = containerRef.current as Element
        if (progressLinear.current == null) {
            progressLinear.current = new MDCLinearProgress(ele)
            progressLinear.current.determinate = false
        }
        showLoading(props.loading)
    }, [props.loading])

    function showLoading(show: boolean) {
        if (show) {
            progressLinear.current?.open()
        } else {
            progressLinear.current?.close()
        }
    }

    return (
        <div ref={containerRef} role="progressbar" className="mdc-linear-progress">
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
