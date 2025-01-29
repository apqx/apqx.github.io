import React from "react"
import {MDCLinearProgress} from "@material/linear-progress"
import ReactDOM from "react-dom";

interface Props {
    loading: boolean
}

export class ProgressLinear extends React.Component<Props, any> {
    progressLinear: MDCLinearProgress | null = null

    init(e: Element) {
        if (e == null) return
        if (this.progressLinear == null) {
            this.progressLinear = new MDCLinearProgress(e)
            this.progressLinear.determinate = false
        }
        this.showLoading(this.props.loading)
    }

    componentDidMount() {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.init(rootE)
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any) {
        this.showLoading(this.props.loading)
    }

    private showLoading(show: boolean) {
        if (show) {
            this.progressLinear?.open()
        } else {
            this.progressLinear?.close()
        }
    }

    render() {
        return (
            <div role="progressbar" className="mdc-linear-progress">
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
