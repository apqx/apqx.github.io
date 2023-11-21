import * as React from "react";
import { console_debug } from "../util/LogUtil"
import { createHtmlContent } from "../util/Tools"
import { ToggleButton } from "./ToggleButton";

export interface SettingsToggleProps {
    titleHtml: string
    on: boolean
    onClickToggle: () => void
    floatTop: boolean
}

export class SettingsToggle extends React.Component<SettingsToggleProps, any> {
    constructor(props: SettingsToggleProps) {
        super(props)
    }

    render() {
        if (this.props.floatTop) {
            return (
                <div className="preference-item-toggle float-top">
                    <span className="preference-item-toggle__title" dangerouslySetInnerHTML={createHtmlContent(this.props.titleHtml)} />
                    <ToggleButton on={this.props.on} onClickToggle={this.props.onClickToggle}/>
                </div>
            )
        } else {
            return (
                <div className="preference-item-toggle">
                    <span className="preference-item-toggle__title" dangerouslySetInnerHTML={createHtmlContent(this.props.titleHtml)} />
                    <ToggleButton on={this.props.on} onClickToggle={this.props.onClickToggle}/>
                </div>
            )
        }
    }
}