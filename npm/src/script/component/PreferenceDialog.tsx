import * as React from "react";
import {PreferenceDialogPresenter} from "./PreferenceDialogPresenter";
import {console_debug} from "../util/LogUtil";
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";
import {MDCSwitch} from '@material/switch';

interface DialogContentState {
    handwritingFontOn: boolean
}

export class PreferenceDialogContent extends React.Component<any, DialogContentState> {
    presenter: PreferenceDialogPresenter
    handwritingFontSwitch: MDCSwitch

    constructor(props) {
        super(props);
        console_debug("PreferenceDialogContent constructor")
        this.presenter = new PreferenceDialogPresenter(this)
        this.onClickHandwritingFontSwitch = this.onClickHandwritingFontSwitch.bind(this)
        this.state = {
            handwritingFontOn: false
        }
    }

    onClickHandwritingFontSwitch() {
        console_debug("PreferenceDialogContent onClickHandwritingSwitch")
        this.presenter.onClickHandwritingFontSwitch(this.handwritingFontSwitch.selected)
    }

    initHandwritingSwitch(e: Element) {
        if (e == null) return
        this.handwritingFontSwitch = new MDCSwitch(e as HTMLButtonElement);
        this.handwritingFontSwitch.selected = this.state.handwritingFontOn
    }

    componentDidMount() {
        console_debug("PreferenceDialogContent componentDidMount")
        this.presenter.loadHandwritingFontSetting()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<DialogContentState>, snapshot?: any) {
        console_debug("PreferenceDialogContent componentDidUpdate")
    }

    shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<DialogContentState>, nextContext: any): boolean {
        console_debug("PreferenceDialogContent shouldComponentUpdate" +
            " state: " + this.state.handwritingFontOn + " -> " + nextState.handwritingFontOn)
        if (this.state.handwritingFontOn != nextState.handwritingFontOn) {
            console_debug("state different, render")
            return true
        }
        console_debug("props and state no change, no render")
        return false
    }

    onDialogOpen(open: boolean) {
        console_debug("PreferenceDialogContent onDialogOpenListener " + open)
    }

    render() {
        console_debug("PreferenceDialogContent render")
        return (
            <div>
                <div className="preference-item-toggle">
                    <span className="preference-item-toggle__title">使用<a
                        href="https://fonts.google.com/specimen/Ma+Shan+Zheng"
                        target="_blank">马善政手写楷书</a>字体</span>
                    <button id="handwriting-switch"
                            className="mdc-switch mdc-switch--unselected preference-item-toggle__toggle" type="button"
                            role="switch"
                            aria-checked="false"
                            ref={e => this.initHandwritingSwitch(e)}
                            onClick={this.onClickHandwritingFontSwitch}>
                        <div className="mdc-switch__track"></div>
                        <div className="mdc-switch__handle-track">
                            <div className="mdc-switch__handle">
                                <div className="mdc-switch__shadow">
                                    <div className="mdc-elevation-overlay"></div>
                                </div>
                                <div className="mdc-switch__ripple"></div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}

export function showPreferenceDialog() {
    console_debug("PreferenceDialogContent showPreferenceDialog ")
    const dialogContentElement = <PreferenceDialogContent/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, "Close", undefined)
}