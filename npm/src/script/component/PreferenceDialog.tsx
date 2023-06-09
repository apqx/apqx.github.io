import * as React from "react";
import { PreferenceDialogPresenter } from "./PreferenceDialogPresenter";
import { console_debug } from "../util/LogUtil";
import { COMMON_DIALOG_WRAPPER_ID, showDialog } from "./BasicDialog";
import { MDCSwitch } from '@material/switch';
import { SettingsToggle } from "./SettingsToggle";
import { localRepository } from "../app";

interface DialogContentState {
    handwritingFontOn: boolean
    autoThemeOn: boolean
}

export class PreferenceDialogContent extends React.Component<any, DialogContentState> {
    presenter: PreferenceDialogPresenter
    handwritingFontSwitch: MDCSwitch

    constructor(props) {
        super(props)
        console_debug("PreferenceDialogContent constructor")
        this.presenter = new PreferenceDialogPresenter(this)
        this.onClickHandwritingFontSwitch = this.onClickHandwritingFontSwitch.bind(this)
        this.onClickAutoThemeSwitch = this.onClickAutoThemeSwitch.bind(this)
        this.state = {
            handwritingFontOn: false,
            autoThemeOn: false
        }
    }

    onClickHandwritingFontSwitch(on: boolean) {
        console_debug("PreferenceDialogContent onClickHandwritingSwitch")
        this.presenter.onClickHandwritingFontSwitch(on)
    }

    onClickAutoThemeSwitch(on: boolean) {
        console_debug("PreferenceDialogContent onClickAutoThemeSwitch")
        this.presenter.onClickAutoThemeSwitch(on)
    }

    componentDidMount() {
        console_debug("PreferenceDialogContent componentDidMount")
        this.presenter.initSettings()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<DialogContentState>, snapshot?: any) {
        console_debug("PreferenceDialogContent componentDidUpdate")
    }

    shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        console_debug("PreferenceDialogContent shouldComponentUpdate")

        if (this.state.handwritingFontOn != nextState.handwritingFontOn
            || this.state.autoThemeOn != nextState.autoThemeOn) {
            console_debug("state different, render")
            return true
        }

        if (this.state.handwritingFontOn != this.presenter.localHandWritingFontOn()
            || this.state.autoThemeOn != this.presenter.localAutoThemeOn()) {
            // state不是最新的，更新state，来触发UI render
            console_debug("state should update, update state, no render")
            this.presenter.initSettings()
            return false
        }
        console_debug("props and state no change, no render")
        return false
    }

    onDialogOpen(open: boolean) {
        console_debug("PreferenceDialogContent onDialogOpenListener " + open)
    }

    handwritingFontTitle = "使用<a href=\"https://fonts.google.com/specimen/Ma+Shan+Zheng\" target=\"_blank\">马善政手写楷书</a>字体"

    render() {
        console_debug("PreferenceDialogContent render")
        return (
            <div>
                <SettingsToggle titleHtml={this.handwritingFontTitle} on={this.state.handwritingFontOn} onClickToggle={this.onClickHandwritingFontSwitch} />
                <SettingsToggle titleHtml="跟随系统自动切换暗色主题" on={this.state.autoThemeOn} onClickToggle={this.onClickAutoThemeSwitch} />
            </div>
        );
    }
}

export function showPreferenceDialog() {
    console_debug("PreferenceDialogContent showPreferenceDialog")
    const dialogContentElement = <PreferenceDialogContent />
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, "Close", undefined, true)
}