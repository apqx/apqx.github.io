import * as React from "react"
import { MDCList } from "@material/list"
import { MDCRipple } from "@material/ripple"
import { ABOUT_DIALOG_WRAPPER_ID, BasicDialog, BasicDialogProps, showDialog } from "./BasicDialog"
import { consoleDebug } from "../../util/log"
import ReactDOM from "react-dom"
import { Button } from "../react/Button"
import { initListItem } from "../list"
// import "./AboutMeDialog.scss"

class AboutMeDialog extends BasicDialog<BasicDialogProps, any> {

    componentDidMount(): void {
        super.componentDidMount()
        this.initList()
    }

    initList() {
        if (this.rootE == null) return
        new MDCList(this.rootE.querySelector("#about-me-dialog_link_list")!!)
    }

    getKunQvLink(): string {
        return window.location.origin + "/post/original/2019/05/18/槐安国内春生酒.html"
    }

    dialogContent(): JSX.Element {
        consoleDebug("AboutMeDialog render")
        return (
            <div className="center">
                <picture>
                    <source srcSet="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me_emoji.webp"
                        type="image/webp" />
                    <img width="100px" height="100px" className="circle-avatar inline-for-center" alt="avatar"
                        src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me_emoji.png" />
                </picture>
                <span className="about-me-name">立泉</span>
                <section className="about-me-tag-wrapper">
                    <Button text="C++" onClick={null} className="btn-tag" />
                    <Button text="Java" onClick={null} className="btn-tag" />
                    <Button text="Kotlin" onClick={null} className="btn-tag" />
                    <Button text="Android" onClick={null} className="btn-tag" />
                    <Button text="Git" onClick={null} className="btn-tag" />
                </section>
                <p className="about-me-description">九五后，旅居杭州，<a
                    href={this.getKunQvLink()}>昆虫</a>，野生散养攻城狮，“十分”“业余”摄影Fans。联系我可以通过<a href="mailto:safari@mudan.me">电子邮件</a>，如果有必要也可以用<a
                        href="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/wechat.jpg">微信</a>。</p>
                <ul className="mdc-deprecated-list mdc-deprecated-list--one-line dialog-link-list" id="about-me-dialog_link_list">
                    <LinkItem link="https://github.com/apqx" title="GitHub" first={true} last={false} />
                    <LinkItem link="https://www.youtube.com/channel/UCF3Qv9tpULGL-CabxSEaCaQ" title="YouTube" first={false} last={false} />
                    <LinkItem link="https://space.bilibili.com/11037907" title="Bilibili" first={false} last={false} />
                    <LinkItem link="https://weibo.com/u/7026785047" title="Weibo" first={false} last={false} />
                    <LinkItem link="mailto:safari@mudan.me" title="Email" first={false} last={true} />
                </ul>
            </div>
        )
    }
}

interface LinkItemProps {
    title: string
    link: string
    first: boolean
    last: boolean
}

class LinkItem extends React.Component<LinkItemProps, any> {
    componentDidMount(): void {
        const rootE = ReactDOM.findDOMNode(this) as Element
        this.initRipple(rootE.querySelector(".mdc-deprecated-list-item")!!)
    }

    initRipple(e: HTMLElement) {
        if (e == null) return
        new MDCRipple(e)
        initListItem(e, this.props.first, this.props.last)
    }

    render() {
        return (
            <li>
                <a className="mdc-deprecated-list-item mdc-deprecated-list-item__darken" href={this.props.link} target="_blank" tabIndex={-1}>
                    <span className="mdc-deprecated-list-item__text link-item">{this.props.title}</span>
                </a>
                {!this.props.last && <hr className="mdc-deprecated-list-divider" />}
            </li>
        )
    }
}
let openCount = 0
export function showAboutMeDialog() {
    showDialog(<AboutMeDialog openCount={openCount++} fixedWidth={true} btnText={"关闭"}
        OnClickBtn={undefined}
        closeOnClickOutside={true} />, ABOUT_DIALOG_WRAPPER_ID)
}
