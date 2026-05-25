import { useCallback, useMemo, useRef, useState } from "react";
import "./AuthDialog.scss"
import { BaseDialog, AUTH_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps } from "./BaseDialog";
import { TextField } from "../react/TextField";
import { getAuthority } from "../../util/auth";
import { showSnackbar } from "../react/Snackbar";

interface AuthDialogProps extends BaseDialogOpenProps {
    authCallback: (success: boolean) => void
}

export function AuthDialog(props: AuthDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textInputRef = useRef<string>("")
    const [closeCounter, setCloseCounter] = useState(0)

    const checkInputAuth = useCallback(() => {
        if (textInputRef.current == null || textInputRef.current.length == 0) {
            showSnackbar("请输入验证信息")
            return
        }
        if (getAuthority().checkInputAuth(textInputRef.current)) {
            props.authCallback(true)
            setCloseCounter(prev => prev + 1)
        } else {
            props.authCallback(false)
            showSnackbar("验证失败")
        }
    }, [props.authCallback])

    const actions = useMemo<ActionBtn[]>(() => {
        return [{
            text: "取消", closeOnClick: true, onClick: () => { }
        }, {
            text: "确认", closeOnClick: false, onClick: () => {
                checkInputAuth()
            }
        }]
    }, [checkInputAuth])

    const onTextChange = useCallback((value: string) => {
        textInputRef.current = value
    }, [])


    return (
        <BaseDialog openCounter={props.openCounter} closeCounter={closeCounter} closeOnClickOutside={false}
            actions={actions}>
            <div ref={containerRef} className="center-inline-items">
                <TextField label="Words" hint="" inputId="auth-dialog-input" classes={["auth-dialog_label"]} onTextChange={onTextChange} onClickEnter={checkInputAuth} tabIndex={-1} />

                <p id="auth-dialog_tips">本内容仅提供小范围查看，请输入我的微信或哔哩哔哩用户名进行访问验证。小声提示：<a
                    href="https://space.bilibili.com/11037907" target="_blank" tabIndex={-1}>哔哩哔哩</a>。</p>

            </div>
        </BaseDialog>
    )
}

let openCounter = 0
export function showAuthDialog(authCallback: (success: boolean) => void) {
    showDialog(<AuthDialog openCounter={openCounter++} authCallback={authCallback} />, AUTH_DIALOG_WRAPPER_ID)
}