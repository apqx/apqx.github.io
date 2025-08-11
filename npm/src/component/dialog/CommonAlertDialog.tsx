import { createHtmlContent } from "../../util/tools"
import { BasicDialog, COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"

interface Props extends BasicDialogProps {
    title: string,
    contentHTML: string
}

class CommonAlertDialog extends BasicDialog<Props, any> {

    dialogContent(): React.JSX.Element {
        return (
            <div>
                <p className="common-alert-dialog_title center-items">{this.props.title}</p>
                <p className="common-alert-dialog_content"
                    dangerouslySetInnerHTML={createHtmlContent(this.props.contentHTML)} />
            </div>
        )
    }
}

let openCount = 0
export function showAlertDialog(title: string, contentHTML: string, btnText: string,
    onClickBtn: (e: React.MouseEvent<HTMLElement>) => void) {
    showDialog(<CommonAlertDialog openCount={openCount++} title={title} contentHTML={contentHTML}
        fixedWidth={false} btnText={btnText} OnClickBtn={onClickBtn}
        closeOnClickOutside={true} />, COMMON_DIALOG_WRAPPER_ID)
}
