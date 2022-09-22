import * as React from "react";
import {MDCLinearProgress} from "@material/linear-progress";

interface Props {
    loading: boolean
}

export class Progressbar extends React.Component<Props, any> {
    progressbar: MDCLinearProgress = null

    init(e: Element) {
        if (e == null) return
        this.progressbar = new MDCLinearProgress(e)
        this.progressbar.determinate = false
        if (this.props.loading) {
            this.progressbar.open()
        } else {
            this.progressbar.close()
        }
    }

    render() {
        return (
            <div role="progressbar" className="mdc-linear-progress" aria-label="Example Progress Bar"
                 // aria-valuemin="0"
                 // aria-valuemax="1" aria-valuenow="0"
                 ref={e => this.init(e)}>
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
}