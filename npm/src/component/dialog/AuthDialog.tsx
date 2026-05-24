import { useCallback, useMemo, useRef, useState } from "react";
import "./AuthDialog.scss"
import { BaseDialog, AUTH_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps } from "./BaseDialog";
import { TextField } from "../react/TextField";
import { getLocalRepository } from "../../repository/LocalDb";

interface AuthDialogProps extends BaseDialogOpenProps {
    authCallback: (success: boolean) => void
}

export function AuthDialog(props: AuthDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textInputRef = useRef<string>("")
    const [closeCounter, setCloseCounter] = useState(0)


    const actions = useMemo<ActionBtn[]>(() => {
        return [{
            text: "取消", closeOnClick: true, onClick: () => { }
        }, {
            text: "确认", closeOnClick: false, onClick: () => {
                if (textInputRef.current == "立泉落落") {
                    props.authCallback(true)
                    getLocalRepository().saveAuth(textInputRef.current)
                    setCloseCounter(prev => prev + 1)
                } else {
                    props.authCallback(false)
                }
            }
        }]
    }, [props.authCallback])

    const onTextChange = useCallback((value: string) => {
        textInputRef.current = value
    }, [])


    return (
        <BaseDialog openCounter={props.openCounter} closeCounter={closeCounter} closeOnClickOutside={false}
            actions={actions}>
            <div ref={containerRef} className="center-inline-items">
                <TextField label="Words" hint="" classes={["auth-dialog_label"]} onTextChange={onTextChange} tabIndex={-1} />

                <p id="auth-dialog_tips"><b>访问验证：</b>本内容仅提供小范围查看，请输入我的微信或哔哩哔哩用户名，小声提示👉🏻<a
                    href="https://space.bilibili.com/11037907" target="_blank" tabIndex={-1}>哔哩哔哩</a>。</p>

            </div>
        </BaseDialog>
    )
}

let openCounter = 0
export function showAuthDialog(authCallback: (success: boolean) => void) {
    showDialog(<AuthDialog openCounter={openCounter++} authCallback={authCallback} />, AUTH_DIALOG_WRAPPER_ID)
}