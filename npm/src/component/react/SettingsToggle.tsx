import "./SettingsToggle.scss"
import { createHtmlContent } from "../../util/tools"
import { createComponent } from '@lit/react'
import { MdSwitch } from '@material/web/switch/switch.js'
import React from "react"

// 新的 @material/web 须借助 lit/react 来创建可以被 react 识别的 component
export const NewMdSwitch = createComponent({
    tagName: 'md-switch',
    elementClass: MdSwitch,
    react: React,
})

interface Props {
    titleHtml: string
    on: boolean
    onClickToggle: () => void
}

export function SettingsToggle(props: Props) {
    return (
        <div className="preference-item-toggle">
            <span className="preference-item-toggle__title one-line"
                dangerouslySetInnerHTML={createHtmlContent(props.titleHtml)} />
            {/* 会自动识别组建内定义的属性 */}
            <NewMdSwitch selected={props.on} onClick={props.onClickToggle} />
        </div>
    )
}