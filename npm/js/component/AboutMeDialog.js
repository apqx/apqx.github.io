import React from "react"
import {showDialog} from "./BasicDialog"
import {MDCRipple} from "@material/ripple"
import {MDCList} from "@material/list"

class SkillChip extends React.Component {

    componentDidMount() {
        new MDCRipple(this.btn)
    }

    render() {
        return (
            <button type="button" className="mdc-button mdc-button--unelevated tag-dialog-trigger btn-tag"
                ref={e => this.btn = e}>
                <span className="mdc-button__ripple"></span>
                <span className="mdc-button__label">{this.props.text}</span>
            </button>
        )
    }
}

class LinkItem extends React.Component {
    render() {
        return(
            <a className="mdc-deprecated-list-item" href={this.props.link} target="_blank">
                <span className="mdc-deprecated-list-item__ripple"></span>
                <span className="mdc-deprecated-list-item__text">{this.props.text}</span>
            </a>
        )
    }
}

class AboutMeDialogContent extends React.Component {
    constructor(props) {
        super(props)
    }


    componentWillUnmount() {
        // console.log("AboutMeDialogContent remove from DOM")
    }

    componentDidMount() {
        // console.log("AboutMeDialogContent add to DOM")
        const mdcList = new MDCList(document.getElementById("about-me-dialog_link_list"))
        // 为每个item添加ripple动画
        mdcList.listElements.map((listItemEl) => new MDCRipple(listItemEl))
    }

    getKunQvLink() {
        return window.location.origin + "/post/original/2019/05/18/槐安国内春生酒.html"
    }

    render() {
        // console.log("render content = " + this.props.content)
        return (
            <div>
                <img height="100px" width="100dx" className="circle-avatar"
                     src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me.jpg"/>
                <h1 className="about-me-name">立泉</h1>
                <span>
                    <SkillChip text="C++"/>
                    <SkillChip text="Java"/>
                    <SkillChip text="Kotlin"/>
                    <SkillChip text="Android"/>
                    <SkillChip text="Git"/>
                </span>
                <p className="about-me-description">九五后，旅居杭州，<a
                    href={this.getKunQvLink()}
                    target="_blank">昆虫</a>，野生散养攻城狮，“十分”“业余”摄影Fans</p>
                <ul className="mdc-deprecated-list dialog-link-list" id="about-me-dialog_link_list">
                    <LinkItem link="https://github.com/apqx" text="GitHub"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="https://www.youtube.com/channel/UCF3Qv9tpULGL-CabxSEaCaQ" text="YouTube"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="https://space.bilibili.com/11037907" text="Bilibili"/>
                    <hr className="mdc-deprecated-list-divider" />
                    <LinkItem link="mailto:changgongapq@gmail.com" text="Email"/>
                </ul>
            </div>
        )
    }
}

export function showAboutMeDialog() {
    // console.log("showAlert content = " + contentHTML)
    const dialogContentElement = <AboutMeDialogContent/>
    showDialog(dialogContentElement, "Close")
}