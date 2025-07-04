// import "./SettingsToggle.scss"
import * as React from "react"
import { createHtmlContent } from "../../util/tools"
import { createComponent } from '@lit/react'
import { MdSwitch } from '@material/web/switch/switch.js'

// 新的@material/web必须借助lit/react来创建可以被react识别的component
export const NewMdSwitch = createComponent({
    tagName: 'md-switch',
    elementClass: MdSwitch,
    react: React,
})

export interface SettingsToggleProps {
    titleHtml: string
    on: boolean
    onClickToggle: () => void
}

export class SettingsToggle extends React.Component<SettingsToggleProps, any> {
    constructor(props: SettingsToggleProps) {
        super(props)
    }

    render() {
        return (
            <div className="preference-item-toggle">
                <span className="preference-item-toggle__title one-line"
                    dangerouslySetInnerHTML={createHtmlContent(this.props.titleHtml)} />
                {/*会自动识别组建内定义的属性*/}
                <NewMdSwitch selected={this.props.on} onClick={this.props.onClickToggle} />
            </div>
        )
    }
}
