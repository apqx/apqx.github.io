import { MDCDialog } from "@material/dialog"

let dialog = undefined

let titleE = undefined
let contentE = undefined
let btnCloseE = undefined
let btnCloseLabelE = undefined

let onClickBtnClose = undefined

function initDialog() {
    if (dialog !== undefined) return
    dialog = new MDCDialog(document.getElementById("common_alert_dialog"))

    titleE = document.getElementById("common_alert_dialog_title")
    contentE = document.getElementById("common_alert_dialog_content")
    btnCloseE = document.getElementById("common_alert_dialog_btn_close")
    btnCloseLabelE = document.getElementById("common_alert_dialog_btn_close_label")

    btnCloseE.addEventListener("click", () => {
        if (onClickBtnClose === undefined) return
        onClickBtnClose()
    })
    dialog.listen("MDCDialog:opened", () => {
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        if (btnCloseE !== undefined) {
            btnCloseE.focus()
            btnCloseE.blur()
        }
    })
    dialog.listen("MDCDialog:closing", () => {
        onClickBtnClose = undefined
    })
}

export function showAlert(title, contentHTML, btnText, _onClickBtnClose) {
    initDialog()
    onClickBtnClose = _onClickBtnClose

    titleE.innerText = title
    contentE.innerHTML = contentHTML
    btnCloseLabelE.innerText = btnText
    dialog.open()
}