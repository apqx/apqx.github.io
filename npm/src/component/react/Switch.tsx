import "./Switch.scss"
import { createComponent } from '@lit/react'
import { MdSwitch } from '@material/web/switch/switch.js'
import React from "react"

// 新的 @material/web 须借助 lit/react 来创建可以被 react 识别的 component
export const NewMdSwitch = createComponent({
    tagName: 'md-switch',
    elementClass: MdSwitch,
    react: React,
})
