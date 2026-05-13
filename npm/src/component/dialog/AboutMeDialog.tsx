import "./AboutMeDialog.scss"
import { ABOUT_DIALOG_WRAPPER_ID, BaseDialog, showDialog } from "./BaseDialog"
import type { BaseDialogOpenProps } from "./BaseDialog"
import { useEffect, useMemo, useRef } from "react"
import { Tag } from "../react/Tag"
import { List } from "../react/List"

function AboutMeDialog(props: BaseDialogOpenProps) {
    const avatarRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        avatarRef.current?.addEventListener("dblclick", (event) => {
            // 双击头像，或许有用
        })
    }, [])

    const kunQvLink = useMemo(() => {
        return window.location.origin + "/post/original/2019/05/18/槐安国内春生酒.html"
    }, [])

    return (
        <BaseDialog openCount={props.openCount}>
            <div className="center-inline-items">
                <picture>
                    <source srcSet="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me_emoji.webp"
                        type="image/webp" />
                    <img className="circle-avatar inline-for-center" alt="avatar" ref={avatarRef}
                        src="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/me_emoji.png" />
                </picture>
                <p className="about-me-name">立泉</p>
                <section className="btn-tag-container about-me-tag-wrapper">
                    <Tag text="C++" />
                    <Tag text="Java" />
                    <Tag text="Kotlin" />
                    <Tag text="Android" />
                    {/* <Tag text="Git" /> */}
                </section>
                <p className="about-me-description">九五后，旅居杭州，<a
                    href={kunQvLink} tabIndex={-1}>昆虫</a>，野生散养攻城狮，“十分”“业余”摄影 Fans。联系我可以通过<a href="mailto:safari@mudan.me" tabIndex={-1}>电子邮件</a>，如果有必要也可用<a
                        href="https://apqx.oss-cn-hangzhou.aliyuncs.com/blog/site/wechat.jpg" target="_blank" tabIndex={-1}>微信</a>。</p>
                <List oneLine={true} items={[
                    { title: "GitHub", link: "https://github.com/apqx", newPage: true },
                    { title: "YouTube", link: "https://www.youtube.com/channel/UCF3Qv9tpULGL-CabxSEaCaQ", newPage: true },
                    { title: "Bilibili", link: "https://space.bilibili.com/11037907", newPage: true },
                    { title: "Weibo", link: "https://weibo.com/u/7026785047", newPage: true },
                ]} />
            </div>
        </BaseDialog>
    )
}

let openCount = 0
export function showAboutMeDialog() {
    showDialog(<AboutMeDialog openCount={openCount++} />, ABOUT_DIALOG_WRAPPER_ID)
}
