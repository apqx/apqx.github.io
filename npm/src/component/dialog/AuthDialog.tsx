import { useCallback, useMemo, useRef, useState } from "react";
import "./AuthDialog.scss"
import { BaseDialog, AUTH_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps } from "./BaseDialog";
import { TextField } from "../react/TextField";
import { getAuthority } from "../../util/auth";
import { showSnackbar } from "../react/Snackbar";

interface AuthDialogProps extends BaseDialogOpenProps {
    authCallback: (success: boolean) => void
    dismissible: boolean
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
        const cancel = {
            text: "取消", closeOnClick: true, onClick: () => { }
        }
        const backToMainPage = {
            text: "返回首页", closeOnClick: true, onClick: () => {
                window.location.href = "/"
            }
        }
        const confirm = {
            text: "确认", closeOnClick: false, onClick: () => {
                checkInputAuth()
            }
        }
        if (props.dismissible) {
            return [cancel, confirm]
        } else {
            return [backToMainPage, confirm]
        }
    }, [checkInputAuth, props.dismissible])

    const onTextChange = useCallback((value: string) => {
        textInputRef.current = value
    }, [])


    return (
        <BaseDialog openCounter={props.openCounter} closeCounter={closeCounter} closeOnClickOutside={props.dismissible}
            actions={actions}>
            <div ref={containerRef} className="center-inline-items">
                <div id="preference-dialog__top-container">
                    <picture>
                        <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.webp"
                            type="image/webp" />
                        <img className="inline-for-center emoji-preference" alt=""
                            src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.gif" />
                    </picture>
                </div>
                <TextField label="Words" hint="" inputId="auth-dialog-input" classes={["auth-dialog_label"]} onTextChange={onTextChange} onClickEnter={checkInputAuth} tabIndex={-1} />

                <p id="auth-dialog_tips">本内容仅为小范围公开，请输入我的微信或哔哩哔哩用户名进行访问验证。小声提示：<a
                    href="https://space.bilibili.com/11037907" target="_blank" tabIndex={-1}>哔哩哔哩</a>。</p>

            </div>
        </BaseDialog>
    )
}

let openCounter = 0
export function showAuthDialog(authCallback: (success: boolean) => void, dismissible: boolean = true) {
    showDialog(<AuthDialog openCounter={openCounter++} authCallback={authCallback} dismissible={dismissible} />, AUTH_DIALOG_WRAPPER_ID)
}