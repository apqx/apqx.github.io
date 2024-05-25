import { MDCRipple } from "@material/ripple";
import React from "react";
import ReactDOM from "react-dom";

export interface Props {
    text: string;
    onClick: () => void;
    classList: string[];
}

export class Button extends React.Component<Props, any> {

    init(e: HTMLElement) {
        new MDCRipple(e)
        if (this.props.classList != null) {
            this.props.classList.forEach((className) => {
                e.classList.add(className)
            })
        }
        if (this.props.onClick != null) {
            e.addEventListener("click", this.props.onClick)
        }
        e.addEventListener("focus", () => {
            e.blur()
        })
    }

    componentDidMount() {
        this.init(ReactDOM.findDOMNode(this) as HTMLElement)
    }

    render() {
        return (
            <button type="button" className="mdc-button mdc-button--unelevated">
                <span className="mdc-button__ripple"></span>
                <span className="mdc-button__label">{this.props.text}</span>
            </button>
        )
    }
}