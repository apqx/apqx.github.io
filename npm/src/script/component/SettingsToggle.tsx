import { MDCSwitch } from "@material/switch"
import * as React from "react";
import { console_debug } from "../util/LogUtil"
import { createHtmlContent } from "../util/Tools"

export interface SettingsToggleProps {
    titleHtml: string
    on: boolean
    onClickToggle: (on: Boolean) => void
}

export interface SettingToggleState {
    titleHtml: string
    on: Boolean
}

export class SettingsToggle extends React.Component<SettingsToggleProps, SettingToggleState> {
    switch: MDCSwitch
    constructor(props) {
        super(props)
        this.onClickSwitch = this.onClickSwitch.bind(this)
        this.state = {
            titleHtml: this.props.titleHtml,
            on: this.props.on
        }
    }

    onClickSwitch(): void {
        console_debug("SettingsToggle onClickSwitch")
        this.props.onClickToggle(this.switch.selected)
    }

    initSwitch(e: Element) {
        if (e == null) return
        this.switch = new MDCSwitch(e as HTMLButtonElement);
        this.switch.selected = this.props.on
    }

    render() {
        return (
            <div className="preference-item-toggle">
                <span className="preference-item-toggle__title" dangerouslySetInnerHTML={createHtmlContent(this.props.titleHtml)}/>
                <button id="handwriting-switch"
                    className="mdc-switch mdc-switch--unselected preference-item-toggle__toggle" type="button"
                    role="switch"
                    aria-checked="false"
                    ref={e => this.initSwitch(e)}
                    onClick={this.onClickSwitch}>
                    <div className="mdc-switch__track"></div>
                    <div className="mdc-switch__handle-track">
                        <div className="mdc-switch__handle">
                            <div className="mdc-switch__shadow">
                                <div className="mdc-elevation-overlay"></div>
                            </div>
                            <div className="mdc-switch__ripple"></div>
                        </div>
                    </div>
                </button>
            </div>
        )
    }
}