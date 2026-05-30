import { useCallback, useMemo, useRef, useState } from "react";
import "./AuthDialog.scss"
import { BaseDialog, AUTH_DIALOG_WRAPPER_ID, showDialog, type ActionBtn, type BaseDialogOpenProps, type BaseDialogController, type DialogControllerRef, getDialogController } from "./BaseDialog";
import { TextField } from "../react/TextField";
import { getAuthority } from "../../util/auth";
import { Length, showSnackbar } from "../react/Snackbar";
import { LottieAnimation, type LottieAnimationController } from "../react/LottieAnimation";

interface AuthDialogProps extends BaseDialogOpenProps {
    authCallback: (success: boolean) => void
    dismissible: boolean
}

export function AuthDialog(props: AuthDialogProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textInputRef = useRef<string>("")
    const animationControllerRef = useRef<LottieAnimationController | null>(null) 

    const checkInputAuth = useCallback(() => {
        if (textInputRef.current == null || textInputRef.current.length == 0) {
            showSnackbar("请输入验证信息", Length.SHORT)
            return
        }
        if (getAuthority().checkInputAuth(textInputRef.current)) {
            props.authCallback(true)
            props.dialogControllerRef?.current?.close()
        } else {
            props.authCallback(false)
            showSnackbar("答案不正确", Length.SHORT)
        }
    }, [props.authCallback])

    const actions = useMemo<ActionBtn[]>(() => {
        const cancel = {
            text: "取消", closeOnClick: true, onClick: () => { }
        }
        const backToMainPage = {
            text: "返回首页", closeOnClick: false, onClick: () => {
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

    const onDialogOpen = useCallback(() => {
        animationControllerRef.current?.play()
    }, [])

    const onDialogClose = useCallback(() => {
        animationControllerRef.current?.pause()
    }, [])

    return (
        <BaseDialog dialogControllerRef={props.dialogControllerRef} onDialogOpen={onDialogOpen} onDialogClose={onDialogClose} closeOnClickOutside={props.dismissible}
            actions={actions}>
            <div ref={containerRef} className="center-inline-items">
                <div id="preference-dialog__top-container">
                    <LottieAnimation animationDataUrl={"https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/lottie.json"}
                        animationControllerRef={animationControllerRef} />
                </div>
                <TextField label="Words" hint="" inputId="auth-dialog-input" classes={["auth-dialog_label"]} onTextChange={onTextChange} onClickEnter={checkInputAuth} tabIndex={-1} />

                <p id="auth-dialog_tips">本内容为小范围公开，请输入我的微信或哔哩哔哩用户名进行访问验证。小声提示：<a
                    href="https://space.bilibili.com/11037907" target="_blank" tabIndex={-1}>哔哩哔哩</a>。</p>

            </div>
        </BaseDialog>
    )
}

export function showAuthDialog(authCallback: (success: boolean) => void, dismissible: boolean = true) {
    const id = AUTH_DIALOG_WRAPPER_ID   
    const dialogControllerRef = getDialogController(id)
    showDialog(<AuthDialog dialogControllerRef={dialogControllerRef} authCallback={authCallback} dismissible={dismissible} />, id)
    if (dialogControllerRef.current) {
        dialogControllerRef.current.open()
    }
}