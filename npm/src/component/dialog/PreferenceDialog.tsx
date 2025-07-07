import "./PreferenceDialog.scss"
import { PreferenceDialogPresenter } from "./PreferenceDialogPresenter"
import { consoleDebug } from "../../util/log"
import { BasicDialog, PREFERENCE_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog"
import type { BasicDialogProps } from "./BasicDialog"
import { SettingsToggle } from "../react/SettingsToggle"

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
    }

    handwrittenFontTitle = "使用<a href=\"https://www.17font.com/font/detail/960a115089a711ee98da67ad58e0ec00.html\" target=\"_blank\">兰亭国风行楷</a>字体"
    notoSerifSCFontTitle = "使用<a href=\"https://source.typekit.com/source-han-serif/cn/\" target=\"_blank\">思源宋体</a>"
    autoThemeTitle = "跟随系统自动切换<a href=\"/post/original/2021/08/03/为博客添加站内搜索和暗黑模式.html\">主题配色</a>"

    dialogContent(): React.JSX.Element {
        consoleDebug("PreferenceDialogContent render")
        return (
            <>
                <div id="preference-dialog__top-container">
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
                    <SettingsToggle titleHtml={this.notoSerifSCFontTitle}
                        on={this.state.notoSerifSCFontOn}
                        onClickToggle={this.onClickNotoSerifSCFontSwitch} />
                    <SettingsToggle titleHtml={this.autoThemeTitle}
                        on={this.state.autoThemeOn}
                        onClickToggle={this.onClickAutoThemeSwitch} />
                </div>
            </>
        )
    }
}

let openCount = 0
export function showPreferenceDialog() {
    consoleDebug("PreferenceDialogContent showPreferenceDialog")
    showDialog(<PreferenceDialog openCount={openCount++} fixedWidth={true} btnText={"关闭"}
        OnClickBtn={undefined} closeOnClickOutside={true} />, PREFERENCE_DIALOG_WRAPPER_ID)
}
