import * as React from "react"
import {MDCIconButtonToggle} from "@material/icon-button";

export interface ToggleButtonProps {
    on: boolean
    onClickToggle: () => void
}

export class ToggleButton extends React.Component<ToggleButtonProps, any> {
    iconBtnToggle: MDCIconButtonToggle

    constructor(props: ToggleButtonProps) {
        super(props)
    }

    initToggleButton(e: Element) {
        if (e == null) return
        const ele = e as HTMLButtonElement
        this.iconBtnToggle = new MDCIconButtonToggle(ele)
        this.iconBtnToggle.on = this.props.on
    }

    render() {
        return (
            <button className="mdc-icon-button"
                    aria-pressed="false"
                    ref={e => this.initToggleButton(e)}
                    onClick={this.props.onClickToggle}>
                <span className="mdc-icon-button__ripple"></span>
                <i className="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">toggle_on</i>
                <i className="material-icons mdc-icon-button__icon">toggle_off</i>
            </button>
        )
    }
}