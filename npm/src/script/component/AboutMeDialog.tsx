import * as React from "react";
import {MDCList} from "@material/list";
import * as url from "url";
import {MDCRipple} from "@material/ripple";
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";

class DialogContent extends React.Component<any, any> {
    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    getKunQvLink(): string {
        return window.location.origin + "/post/original/2019/05/18/槐安国内春生酒.html"
    }

    render() {
        return (
            <div className="center-horizontal">
                <img height="100px" width="100dx" className="circle-avatar"
                     src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me.jpg"
                     alt="avatar"/>
                <h1 className="about-me-name">立泉</h1>
                <span className="about-me-tag-wrapper">
                    <SkillChip text="C++"/>
                    <SkillChip text="Java"/>
                    <SkillChip text="Kotlin"/>
                    <SkillChip text="Android"/>
                    <SkillChip text="Git"/>
                </span>
                <p className="about-me-description">九五后，旅居杭州，<a
                    href={this.getKunQvLink()}
                    target="_blank">昆虫</a>，野生散养攻城狮，“十分”“业余”摄影Fans</p>
                <ul className="mdc-deprecated-list dialog-link-list" id="about-me-dialog_link_list"
                    ref={e => this.initList(e)}>
                    <LinkItem link="https://github.com/apqx" title="GitHub"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="https://www.youtube.com/channel/UCF3Qv9tpULGL-CabxSEaCaQ" title="YouTube"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="https://space.bilibili.com/11037907" title="Bilibili"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="mailto:changgongapq@gmail.com" title="Email"/>
                </ul>
            </div>
        )
    }
}

interface SkillChipProps {
    text: string
}

class SkillChip extends React.Component<SkillChipProps, any> {
    initButton(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <span className="mdc-button mdc-button--unelevated btn-tag"
                  ref={e => this.initButton(e)}>
                <span className="mdc-button__ripple"></span>
                <span className="mdc-button__label">{this.props.text}</span>
            </span>
        )
    }
}

interface LinkItemProps {
    title: string
    link: string
}

class LinkItem extends React.Component<LinkItemProps, any> {
    initRipple(e: Element) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return(
            <a className="mdc-deprecated-list-item" href={this.props.link} target="_blank"
               ref={e => this.initRipple(e)}>
                <span className="mdc-deprecated-list-item__ripple"></span>
                <span className="mdc-deprecated-list-item__text">{this.props.title}</span>
            </a>
        )
    }
}

export function showAboutMeDialog() {
    const dialogContentElement = <DialogContent />
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, "Close", undefined)
}