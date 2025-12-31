import "./ProgressCircular.scss"
import React, { useEffect, useRef } from "react"
import { MDCCircularProgress } from '@material/circular-progress'

interface Props {
    loading: boolean
}

export function ProgressCircular(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const progressCircular = useRef<MDCCircularProgress | null>(null)

    useEffect(() => {
        const ele = containerRef.current as Element
        if (progressCircular.current == null) {
            progressCircular.current = new MDCCircularProgress(ele)
            progressCircular.current.determinate = false
        }
        showLoading(props.loading)
    }, [props.loading])

    function showLoading(show: boolean) {
        if (show) {
            progressCircular.current?.open()
        } else {
            progressCircular.current?.close()
        }
    }

    return  (
            <div ref={containerRef} className="mdc-circular-progress" style={{ width: "2.8rem", height: "2.8rem" }} role="progressbar" aria-valuemin={0} aria-valuemax={1}>
                <div className="mdc-circular-progress__determinate-container">
                    <svg className="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <circle className="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" strokeWidth="4" />
                        <circle className="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" strokeDasharray="113.097" strokeDashoffset="113.097" strokeWidth="4" />
                    </svg>
                </div>
                <div className="mdc-circular-progress__indeterminate-container">
                    <div className="mdc-circular-progress__spinner-layer">
                        <div className="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" strokeDasharray="113.097" strokeDashoffset="56.549" strokeWidth="4" />
                            </svg>
                        </div>
                        <div className="mdc-circular-progress__gap-patch">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" strokeDasharray="113.097" strokeDashoffset="56.549" strokeWidth="3.2" />
                            </svg>
                        </div>
                        <div className="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
                            <svg className="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="18" strokeDasharray="113.097" strokeDashoffset="56.549" strokeWidth="4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        )
}