import * as React from "react";
import {PreferenceDialogPresenter} from "./PreferenceDialogPresenter";
import {console_debug} from "../util/LogUtil";
import {BasicDialog, BasicDialogProps, showDialog} from "./BasicDialog";
import {SettingsToggle} from "./SettingsToggle";

interface DialogContentState {
    handwrittenFontOn: boolean
    autoThemeOn: boolean
}
export class PreferenceDialog extends BasicDialog<BasicDialogProps, DialogContentState> {
    presenter: PreferenceDialogPresenter

    constructor(props) {
        super(props)
        console_debug("PreferenceDialogContent constructor")
        this.presenter = new PreferenceDialogPresenter(this)
        this.onClickHandwritingFontSwitch = this.onClickHandwritingFontSwitch.bind(this)
        this.onClickAutoThemeSwitch = this.onClickAutoThemeSwitch.bind(this)
        this.state = {
            handwrittenFontOn: false,
            autoThemeOn: false
        }
    }

    onClickHandwritingFontSwitch() {
        console_debug("PreferenceDialogContent onClickHandwritingSwitch")
        const newState = !this.state.handwrittenFontOn
        this.presenter.onClickHandwritingFontSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            handwrittenFontOn: newState
        })
    }

    onClickAutoThemeSwitch() {
        console_debug("PreferenceDialogContent onClickAutoThemeSwitch")
        const newState = !this.state.autoThemeOn
        this.presenter.onClickAutoThemeSwitch(newState)
        // 更新state，刷新UI
        this.setState({
            autoThemeOn: newState
        })
    }

    componentDidMount() {
        super.componentDidMount()
        console_debug("PreferenceDialogContent componentDidMount")
        this.presenter.initSettings()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<DialogContentState>, snapshot?: any) {
        console_debug("PreferenceDialogContent componentDidUpdate")
    }

    shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        console_debug("PreferenceDialogContent shouldComponentUpdate")
        super.shouldComponentUpdate(nextProps, nextState, nextContext)
        if (this.state.handwrittenFontOn != nextState.handwrittenFontOn
            || this.state.autoThemeOn != nextState.autoThemeOn) {
            console_debug("state different, render")
            return true
        }

        if (this.state.handwrittenFontOn != this.presenter.localHandWritingFontOn()
            || this.state.autoThemeOn != this.presenter.localAutoThemeOn()) {
            // state不是最新的，更新state，来触发UI render
            console_debug("state should update, update state, no render")
            this.presenter.initSettings()
            return false
        }
        console_debug("props and state no change, no render")
        return false
    }

    handwrittenFontTitle = "使用<a href=\"https://www.hanyi.com.cn/productdetail.php?id=8433&type=0\" target=\"_blank\">汉仪颐和仙境楷书</a>字体"

    dialogContent(): JSX.Element {
        console_debug("PreferenceDialogContent render")
        return (
            <>
                <div className="center-horizontal">
                    <picture>
                        <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f636/512.webp"
                                type="image/webp"/>
                        <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f636/512.gif" alt="" width="64"
                             height="64"/>
                    </picture>
                </div>
                <SettingsToggle titleHtml={this.handwrittenFontTitle}
                                on={this.state.handwrittenFontOn}
                                onClickToggle={this.onClickHandwritingFontSwitch}
                                floatTop={false}/>
                <SettingsToggle titleHtml="跟随系统自动切换暗色主题"
                                on={this.state.autoThemeOn}
                                onClickToggle={this.onClickAutoThemeSwitch}
                                floatTop={true}/>
            </>
        );
    }
}

export function showPreferenceDialog() {
    console_debug("PreferenceDialogContent showPreferenceDialog")
    showDialog(<PreferenceDialog fixedWidth={true} btnText={"Cancel"}
                                                  btnOnClick={null} closeOnClickOutside={true} />)
}