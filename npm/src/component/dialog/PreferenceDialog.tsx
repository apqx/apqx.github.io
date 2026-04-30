import "./PreferenceDialog.scss"
import { PreferenceDialogViewModel } from "./PreferenceDialogViewModel"
import { consoleInfo } from "../../util/log"
import { BaseDialog, PREFERENCE_DIALOG_WRAPPER_ID, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { NewMdSwitch } from "../react/Switch"
import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import { setupListItemRipple } from "../list"
import { createHtmlContent } from "../../util/tools"
import { EVENT_PAGE_BACK_FROM_CACHE, getEventEmitter, type Events } from "../base/EventBus"

export function PreferenceDialog(props: BaseDialogOpenProps) {
    const viewModel = useMemo(() => {
        return new PreferenceDialogViewModel()
    }, [])

    const state = useSyncExternalStore(viewModel.subscribe, () => viewModel.state)

    useEffect(() => {
        consoleInfo("PreferenceDialogContent useEffect, subscribe to viewModel")
        // viewModel.initSettings()
        const emitter = getEventEmitter()
        const pageEventListener = (pageEvent: Events["pageEvent"]) => {
            consoleInfo("PreferenceDialogContent receive event: " + pageEvent)
            // 订阅页面从缓存中恢复的事件，加载最新的设置状态
            if (pageEvent == EVENT_PAGE_BACK_FROM_CACHE) {
                viewModel.initSettings()
            }
        }
        emitter.on("pageEvent", pageEventListener)
        return () => {
            emitter.off("pageEvent", pageEventListener)
        }
    }, [])

    const notoSerifSCFontTitle = useMemo(() => {
        return "使用<a href=\"https://source.typekit.com/source-han-serif/cn/\" target=\"_blank\" tabIndex=\"-1\">思源宋体</a>"
    }, [])

    const autoThemeTitle = useMemo(() => {
        return "自适应<a href=\"/post/original/2021/08/03/为博客添加站内搜索和深色模式.html\" tabIndex=\"-1\">主题颜色</a>"
    }, [])

    const onDialogOpen = useCallback(() => {
        consoleInfo("PreferenceDialogContent onDialogOpen")
        viewModel.initSettings()
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
                    <SettingsToggle titleHtml="固定顶部导航栏" description="滚动时导航栏固定显示在顶部"
                        on={state.fixedTopbar}
                        onChange={viewModel.onClickFixedTopbarSwitch} />
                    <SettingsToggle titleHtml="隐藏状态栏背景" description="边到边模式下隐藏顶部状态栏背景"
                        on={state.hideStatusBarBg}
                        onChange={viewModel.onClickHideStatusBarBgSwitch} />
                    <SettingsToggle titleHtml={"透镜大图模式"} description="减少透镜分区小尺寸屏幕的分栏数"
                        on={state.lensBiggerPicture}
                        onChange={viewModel.onClickLensBiggerPictureSwitch} />
                    <SettingsToggle titleHtml={notoSerifSCFontTitle} description="全局字体从默认黑体改为衬线宋体"
                        on={state.notoSerifSCFont}
                        onChange={viewModel.onClickNotoSerifSCFontSwitch} />
                    <SettingsToggle titleHtml={autoThemeTitle} description="跟随系统设置自动切换明暗配色"
                        on={state.autoTheme}
                        onChange={viewModel.onClickAutoThemeSwitch} />
                </ul>
            </>
        </BaseDialog>
    )
}

interface SettingsToggleProps {
    titleHtml: string
    description?: string
    on: boolean
    onChange: (event: Event) => void
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
                <div className="mdc-deprecated-list-item__text">
                    <div className="list-item__primary-text preference-item-toggle__title one-line"
                        dangerouslySetInnerHTML={createHtmlContent(props.titleHtml)} />
                    {
                        props.description &&
                        <div className="list-item__secondary-text preference-item-toggle__description">
                            {props.description}
                        </div>
                    }
                </div>
                {/* 会自动识别组建内定义的属性 */}
                <NewMdSwitch icons selected={props.on} onChange={props.onChange} />
            </div>
            <hr className="mdc-deprecated-list-divider" />
        </li>
    )
}

let openCount = 0
export function showPreferenceDialog() {
    consoleInfo("PreferenceDialogContent showPreferenceDialog")
    showDialog(<PreferenceDialog openCount={openCount++} />, PREFERENCE_DIALOG_WRAPPER_ID)
}
