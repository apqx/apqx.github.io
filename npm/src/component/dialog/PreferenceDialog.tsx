import * as React from "react"
import { PreferenceDialogPresenter } from "./PreferenceDialogPresenter"
import { consoleDebug } from "../../util/log"
import { BasicDialog, BasicDialogProps, PREFERENCE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import { SettingsToggle } from "./SettingsToggle"
// import "./PreferenceDialog.scss"

interface DialogContentState {
    fixedTopbarOn: boolean
    handwrittenFontOn: boolean
    notoSerifSCFontOn: boolean
    autoThemeOn: boolean
}

export class PreferenceDialog extends BasicDialog<BasicDialogProps, DialogContentState> {
    presenter: PreferenceDialogPresenter

    constructor(props) {
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
        consoleDebug("PreferenceDialogContent onClickAutoThemeSwitch")
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
        this.presenter.initSettings()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<DialogContentState>, snapshot?: any) {
        consoleDebug("PreferenceDialogContent componentDidUpdate")
    }

    shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        consoleDebug("PreferenceDialogContent shouldComponentUpdate")
        super.shouldComponentUpdate(nextProps, nextState, nextContext)
        if (this.state.fixedTopbarOn != nextState.fixedTopbarOn ||
            this.state.handwrittenFontOn != nextState.handwrittenFontOn ||
            this.state.autoThemeOn != nextState.autoThemeOn) {
            consoleDebug("State different, render")
            return true
        }

        if (this.state.fixedTopbarOn != this.presenter.localFixedTopbarOn() ||
            this.state.handwrittenFontOn != this.presenter.localHandWritingFontOn() ||
            this.state.autoThemeOn != this.presenter.localAutoThemeOn()) {
            // state不是最新的，更新state，来触发UI render
            consoleDebug("State should update, update state, no render")
            this.presenter.initSettings()
            return false
        }
        consoleDebug("Props and state no change, no render")
        return false
    }

    handwrittenFontTitle = "使用<a href=\"https://www.17font.com/font/detail/960a115089a711ee98da67ad58e0ec00.html\" target=\"_blank\">兰亭国风行楷</a>字体"
    notoSerifSCFontTitle = "使用<a href=\"https://source.typekit.com/source-han-serif/cn/\" target=\"_blank\">思源宋体</a>字体"
    autoThemeTitle = "跟随系统自动切换<a href=\"/post/original/2021/08/03/为博客添加站内搜索和暗黑模式.html\">主题配色</a>"

    dialogContent(): JSX.Element {
        consoleDebug("PreferenceDialogContent render")
        return (
            <>
                <div className="center" id="preference-dialog__top-container">
                    <picture>
                        <source srcSet="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.webp"
                            type="image/webp" />
                        <img width="64px" height="64px" className="inline-for-center" alt=""
                            src="https://apqx-host.oss-cn-hangzhou.aliyuncs.com/blog/emojis/noto-animated-emoji/mouth-none/512.gif" />
                    </picture>
                </div>
                <div id="preference-dialog__toggle-container">
                    <SettingsToggle titleHtml="固定顶部标题栏"
                        on={this.state.fixedTopbarOn}
                        onClickToggle={this.onClickFixedTopbarSwitch} />
                    {/* <SettingsToggle titleHtml={this.handwrittenFontTitle}
                        on={this.state.handwrittenFontOn}
                        onClickToggle={this.onClickHandwritingFontSwitch} /> */}
                    {/* <SettingsToggle titleHtml={this.notoSerifSCFontTitle}
                        on={this.state.notoSerifSCFontOn}
                        onClickToggle={this.onClickNotoSerifSCFontSwitch} /> */}
                    <SettingsToggle titleHtml={this.autoThemeTitle}
                        on={this.state.autoThemeOn}
                        onClickToggle={this.onClickAutoThemeSwitch} />
                </div>
            </>
        )
    }
}

export function showPreferenceDialog() {
    consoleDebug("PreferenceDialogContent showPreferenceDialog")
    showDialog(<PreferenceDialog fixedWidth={true} btnText={"关闭"}
        OnClickBtn={null} closeOnClickOutside={true} />, PREFERENCE_DIALOG_WRAPPER_ID)
}
