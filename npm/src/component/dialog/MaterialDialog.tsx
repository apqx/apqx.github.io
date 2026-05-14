import { List } from "../react/List"
import { BaseDialog, MATERIAL_DIALOG_WRAPPER_ID, showDialog, type BaseDialogOpenProps } from "./BaseDialog"
import "./MaterialDialog.scss"


function MaterialDialog(props: BaseDialogOpenProps) {


    return (
        <BaseDialog openCount={props.openCount}>
            <p>设计与资源列表</p>
            <List oneLine={false} items={[
                { title: "Google Material Design", description: "https://m3.material.io", 
                    link: "https://m3.material.io", newPage: true },
                { title: "Material Design 2: Github", description: "https://github.com/material-components/material-components-web", 
                    link: "https://github.com/material-components/material-components-web", newPage: true },
                { title: "Material Design 2: Demo", description: "https://material-components.github.io/material-components-web-catalog", 
                    link: "https://material-components.github.io/material-components-web-catalog", newPage: true },
                { title: "Material Design 3: Github", description: "https://github.com/material-components/material-web", 
                    link: "https://github.com/material-components/material-web", newPage: true },
                { title: "Material Design 3: Demo", description: "https://material-web.dev", 
                    link: "https://material-web.dev", newPage: true },
            ]} />
        </BaseDialog>
    )
}

let openCount = 0
export function showMaterialDialog() {
    showDialog(<MaterialDialog openCount={openCount++} />, MATERIAL_DIALOG_WRAPPER_ID)
}