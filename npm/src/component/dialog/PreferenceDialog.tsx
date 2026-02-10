import "./PreferenceDialog.scss"
import { PreferenceDialogPresenter } from "./PreferenceDialogPresenter"
import { consoleDebug } from "../../util/log"
import { BaseDialog, PREFERENCE_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { NewMdSwitch } from "../react/Switch"
import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import { setupListItemRipple } from "../list"
import { createHtmlContent } from "../../util/tools"

export function PreferenceDialog(props: BaseDialogOpenProps) {
    const presenter = useMemo(() => {
        return new PreferenceDialogPresenter()
    }, [])

    const state = useSyncExternalStore(presenter.subscribe, () => presenter.state)

    useEffect(() => {
        consoleDebug("PreferenceDialogContent useEffect, subscribe to presenter")
        // presenter.initSettings()
    }, [])

    const notoSerifSCFontTitle = useMemo(() => {
        return "使用<a href=\"https://source.typekit.com/source-han-serif/cn/\" target=\"_blank\">思源宋体</a>"
    }, [])

    const autoThemeTitle = useMemo(() => {
        return "自适应<a href=\"/post/original/2021/08/03/为博客添加站内搜索和深色模式.html\">主题颜色</a>"
    }, [])

    const onDialogOpen = useCallback(() => {
        consoleDebug("PreferenceDialogContent onDialogOpen")
        presenter.initSettings()
    }, [])

    return (
        <BaseDialog openCount={props.openCount} onDialogOpen={onDialogOpen}>
            <>
                <div id="preference-dialog__top-container">
                    <picture>
                        <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.webp"
                            type="image/webp" />
                        <img className="inline-for-center emoji-preference" alt=""
                            src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.gif" />
                    </picture>
                </div>
                <ul className="mdc-deprecated-list mdc-deprecated-list--one-line dialog-link-list" id="preference-dialog__toggle-container">
                    <SettingsToggle titleHtml="固定顶部导航栏"
                        on={state.fixedTopbarOn}
                        onClickToggle={presenter.onClickFixedTopbarSwitch} />
                    <SettingsToggle titleHtml={notoSerifSCFontTitle}
                        on={state.notoSerifSCFontOn}
                        onClickToggle={presenter.onClickNotoSerifSCFontSwitch} />
                    <SettingsToggle titleHtml={autoThemeTitle}
                        on={state.autoThemeOn}
                        onClickToggle={presenter.onClickAutoThemeSwitch} />
                </ul>
            </>
        </BaseDialog>
    )
}

interface SettingsToggleProps {
    titleHtml: string
    on: boolean
    onClickToggle: () => void
}

export function SettingsToggle(props: SettingsToggleProps) {
    const containerRef = React.useRef<HTMLLIElement>(null)

    useEffect(() => {
        const rootE = containerRef.current as HTMLElement;
        const liE = rootE.querySelector(".mdc-deprecated-list-item") as HTMLElement
        setupListItemRipple(liE)
    }, [])

    return (
        <li ref={containerRef}>
            <div className="mdc-deprecated-list-item mdc-deprecated-list-item__no-hover mdc-deprecated-list-item__darken preference-item-toggle">
                <span className="mdc-deprecated-list-item__text preference-item-toggle__title one-line"
                    dangerouslySetInnerHTML={createHtmlContent(props.titleHtml)} />
                {/* 会自动识别组建内定义的属性 */}
                <NewMdSwitch selected={props.on} onClick={props.onClickToggle} />
            </div>
            <hr className="mdc-deprecated-list-divider" />
        </li>
    )
}

let openCount = 0
export function showPreferenceDialog() {
    consoleDebug("PreferenceDialogContent showPreferenceDialog")
    showDialog(<PreferenceDialog openCount={openCount++} />, PREFERENCE_DIALOG_WRAPPER_ID)
}
