import "./PreferenceDialog.scss"
import { PreferenceDialogPresenter } from "./PreferenceDialogPresenter"
import { consoleDebug } from "../../util/log"
import { BasicDialog, PREFERENCE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { NewMdSwitch } from "../react/SettingsToggle"
import { MDCList } from "@material/list"
import React, { useEffect } from "react"
import { setupListItemRipple } from "../list"
import { createHtmlContent } from "../../util/tools"

interface DialogContentState {
    fixedTopbarOn: boolean
    handwrittenFontOn: boolean
    notoSerifSCFontOn: boolean
    autoThemeOn: boolean
}

export class PreferenceDialog extends BasicDialog<BasicDialogProps, DialogContentState> {
    presenter: PreferenceDialogPresenter

    constructor(props: BasicDialogProps) {
        super(props)
        consoleDebug("PreferenceDialogContent constructor")
        this.presenter = new PreferenceDialogPresenter(this)
        this.onClickFixedTopbarSwitch = this.onClickFixedTopbarSwitch.bind(this)
        this.onClickHandwritingFontSwitch = this.onClickHandwritingFontSwitch.bind(this)
        this.onClickNotoSerifSCFontSwitch = this.onClickNotoSerifSCFontSwitch.bind(this)
        this.onClickAutoThemeSwitch = this.onClickAutoThemeSwitch.bind(this)
        this.state = {
            fixedTopbarOn: false,
            handwrittenFontOn: false,
            notoSerifSCFontOn: false,
            autoThemeOn: false
        }
    }

    onDialogOpen(): void {
        consoleDebug("PreferenceDialogContent onDialogOpen")
        this.presenter.initSettings()
        // TODO: Toggle点击时自己会切换状态，如果这里更新State给Toggle设置状态，可能会导致Toggle状态不正确
        // 一个思路是Toggle不使用state，而是dialog弹出时获取一个初始值

        // BUG: toggle为开的状态，通过topbar切换主题后，再打开设置对话框，toggle状态随之变化，但是点击toggle不会触发UI切换，主题存储是正常的
        // 用Material Icon的图标代替
    }

    onClickFixedTopbarSwitch() {
        consoleDebug("PreferenceDialogContent onClickFixedTopbarSwitch")
        const newState = !this.state.fixedTopbarOn
        this.presenter.onClickFixedTopbarSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            fixedTopbarOn: newState
        })
    }

    onClickHandwritingFontSwitch() {
        consoleDebug("PreferenceDialogContent onClickHandwritingSwitch")
        const newState = !this.state.handwrittenFontOn
        this.presenter.onClickHandwritingFontSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            handwrittenFontOn: newState
        })
    }

    onClickNotoSerifSCFontSwitch() {
        consoleDebug("PreferenceDialogContent onClickNotoSerifSwitch")
        const newState = !this.state.notoSerifSCFontOn
        this.presenter.onClickNotoSerifSCFontSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            notoSerifSCFontOn: newState
        })
    }

    onClickAutoThemeSwitch() {
        consoleDebug("PreferenceDialogContent onClickAutoThemeSwitch, current state: " + this.state.autoThemeOn)
        const newState = !this.state.autoThemeOn
        this.presenter.onClickAutoThemeSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            autoThemeOn: newState
        })
    }

    componentDidMount() {
        super.componentDidMount()
        consoleDebug("PreferenceDialogContent componentDidMount")
        this.initList()
    }

    initList() {
        if (this.rootE == null) return
        new MDCList(this.rootE.querySelector("#preference-dialog__toggle-container")!!)
    }

    handwrittenFontTitle = "使用<a href=\"https://www.17font.com/font/detail/960a115089a711ee98da67ad58e0ec00.html\" target=\"_blank\">兰亭国风行楷</a>字体"
    notoSerifSCFontTitle = "使用<a href=\"https://source.typekit.com/source-han-serif/cn/\" target=\"_blank\">思源宋体</a>"
    autoThemeTitle = "自适应<a href=\"/post/original/2021/08/03/为博客添加站内搜索和深色模式.html\">主题颜色</a>"

    dialogContent(): React.JSX.Element {
        consoleDebug("PreferenceDialogContent render")
        return (
            <>
                <div id="preference-dialog__top-container">
                    <picture>
                        <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.webp"
                            type="image/webp" />
                        <img className="inline-for-center emoji-preference" alt=""
                            src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.gif" />
                    </picture>
                </div>
                {/* TODO: 应用 Material Design 列表样式 */}
                <ul className="mdc-deprecated-list mdc-deprecated-list--one-line dialog-link-list" id="preference-dialog__toggle-container">
                    <SettingsToggle titleHtml="固定顶部导航栏"
                        on={this.state.fixedTopbarOn}
                        onClickToggle={this.onClickFixedTopbarSwitch} />
                    {/* <SettingsToggle titleHtml={this.handwrittenFontTitle}
                        on={this.state.handwrittenFontOn}
                        onClickToggle={this.onClickHandwritingFontSwitch} /> */}
                    <SettingsToggle titleHtml={this.notoSerifSCFontTitle}
                        on={this.state.notoSerifSCFontOn}
                        onClickToggle={this.onClickNotoSerifSCFontSwitch} />
                    <SettingsToggle titleHtml={this.autoThemeTitle}
                        on={this.state.autoThemeOn}
                        onClickToggle={this.onClickAutoThemeSwitch} />
                </ul>
            </>
        )
    }
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
