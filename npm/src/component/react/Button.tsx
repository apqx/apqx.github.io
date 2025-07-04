// import "./Button.scss"
import { MDCRipple } from "@material/ripple"
import React from "react"
import ReactDOM from "react-dom"
import { consoleDebug, consoleObjDebug } from "../../util/log"
import { clearFocusListener } from "../../util/tools"

export interface Props {
    text: string
    onClick: (() => void) | null;
    className: string;
}

export class Button extends React.Component<Props, any> {

    init(e: HTMLElement) {
        new MDCRipple(e)

        if (this.props.className != null && this.props.className.length > 0) {
            const classes = this.props.className.split(" ")
            classes.forEach((c) => {
                e.classList.add(c)
            })
        }
        if (this.props.onClick != null) {
            e.addEventListener("click", this.props.onClick)
        }
        e.addEventListener("focus", clearFocusListener)
    }

    componentDidMount() {
        this.init(ReactDOM.findDOMNode(this) as HTMLElement)
    }

    render() {
        return (
            <button type="button" className="mdc-button" tabIndex={-1}>
                <span className="mdc-button__label">{this.props.text}</span>
            </button>
        )
    }
}