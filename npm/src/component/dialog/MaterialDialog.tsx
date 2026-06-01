import { useRef } from "react"
import { List } from "../react/List"
import { BaseDialog, getDialogController, MATERIAL_DIALOG_WRAPPER_ID, showDialog, type BaseDialogController, type BaseDialogOpenProps, type DialogControllerRef } from "./BaseDialog"
import "./MaterialDialog.scss"


function MaterialDialog(props: BaseDialogOpenProps) {


    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef}>
            <p>设计与资源列表</p>
            <List oneLine={false} items={[
                {
                    title: "Google Material Design", description: "https://m3.material.io",
                    link: "https://m3.material.io", newPage: true
                },
                {
                    title: "Material Design 2: Github", description: "https://github.com/material-components/material-components-web",
                    link: "https://github.com/material-components/material-components-web", newPage: true
                },
                {
                    title: "Material Design 2: Demo", description: "https://material-components.github.io/material-components-web-catalog",
                    link: "https://material-components.github.io/material-components-web-catalog", newPage: true
                },
                {
                    title: "Material Design 3: Github", description: "https://github.com/material-components/material-web",
                    link: "https://github.com/material-components/material-web", newPage: true
                },
                {
                    title: "Material Design 3: Demo", description: "https://material-web.dev",
                    link: "https://material-web.dev", newPage: true
                },
                {
                    title: "Material Symbols & Fonts", description: "https://fonts.google.com/icons",
                    link: "https://fonts.google.com/icons", newPage: true
                },
                {
                    title: "Noto Animated Color Emoji", description: "https://googlefonts.github.io/noto-emoji-animation",
                    link: "https://googlefonts.github.io/noto-emoji-animation/", newPage: true
                },
            ]} />
        </BaseDialog>
    )
}

export function showMaterialDialog() {
    const id = MATERIAL_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<MaterialDialog dialogControllerRef={dialogControllerRef} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}