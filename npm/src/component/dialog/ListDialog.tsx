import { List, type ListItemProps } from "../react/List"
import { BaseDialog, getDialogController, MATERIAL_DIALOG_WRAPPER_ID, showDialog, type BaseDialogOpenProps } from "./BaseDialog"
import "./ListDialog.scss"

export interface ListDialogProps extends BaseDialogOpenProps {
    title: string
    description: string
    list: ListItemProps[]
}

function ListDialog(props: ListDialogProps) {


    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef}>
            {/* <p>参考 Material Design 设计风格，并依据个人倾向取舍。</p> */}
            <p className="list-dialog-title">{props.title}</p>
            <p className="list-dialog-description">{props.description}</p>
            <List oneLine={false} items={props.list} />
        </BaseDialog>
    )
}

export function showListDialog(title: string, description: string, list: ListItemProps[]) {
    const id = MATERIAL_DIALOG_WRAPPER_ID
    const dialogControllerRef = getDialogController(id)
    showDialog(<ListDialog title={title} list={list} description={description} dialogControllerRef={dialogControllerRef} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}