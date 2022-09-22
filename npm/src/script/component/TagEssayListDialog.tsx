import * as React from "react";
import {MDCList} from "@material/list";
import {Progressbar} from "./Progressbar";
import {MDCRipple} from "@material/ripple";
import {COMMON_DIALOG_WRAPPER_ID, showDialog} from "./BasicDialog";

interface DialogContentProps {
    tag: string,
    showLoading: boolean,
    essayList: EssayItemData[]
}

class DialogContent extends React.Component<DialogContentProps, any> {
    initList(e: Element) {
        if (e == null) return
        new MDCList(e)
    }

    render() {
        return (
            <div>
                <p className="mdc-theme--on-surface">标记TAG
                    <code id="tag-dialog-tag-name"
                          className="language-plaintext highlighter-rouge">{this.props.tag}</code>
                    的<span>博文</span>
                </p>

                <Progressbar loading={this.props.showLoading}/>

                <ul className="mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list"
                    ref={e => this.initList(e)}>
                    {this.props.essayList != null && this.props.essayList.map(item =>
                        <EssayItem
                            key={item.title + item.date}
                            data={new EssayItemData(item.url, item.title, item.date, item.type, item.block1Array, item.block2Array)}
                            isLast={this.props.essayList.indexOf(item) === (this.props.essayList.length - 1)}
                        />
                    )}

                </ul>
            </div>
        )
    }
}

export class EssayItemData {
    url: string
    title: string
    date: string
    type: string
    block1Array: string[]
    block2Array: string[]

    constructor(url: string,
                title: string,
                date: string,
                type: string,
                block1Array: string[],
                block2Array: string[]) {
        this.url = url
        this.title = title
        this.date = date
        this.type = type
        this.block1Array = block1Array
        this.block2Array = block2Array
    }
}

interface EssayItemProps {
    data: EssayItemData
    isLast: boolean
}

class EssayItem extends React.Component<EssayItemProps, any> {
    initRipple(e) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <div>
                <a className="mdc-deprecated-list-item tag-list-item mdc-ripple-upgraded"
                   href={this.props.data.url}
                   ref={e => this.initRipple(e)}>
                    <span className="mdc-deprecated-list-item__ripple"></span>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="my-list-item__primary-text">{this.props.data.title}</span>
                        <div className="my-list-item__secondary-text">
                            <span>{this.props.data.date}</span>
                            <span className="tag-essay-item-tags-container">
                                <span className="tag-essay-item-post-type">{this.props.data.type}</span>
                                {this.props.data.block1Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block1">{block}</span>
                                )}
                                {this.props.data.block2Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block2">{block}</span>
                                )}
                            </span>
                        </div>
                    </span>
                </a>
                {!this.props.isLast && <hr className="mdc-deprecated-list-divider"/>}
            </div>
        )
    }
}

export function showTagEssayListDialog(_tag: string, _essayList: EssayItemData[], _showLoading: boolean) {
    const dialogContentElement = <DialogContent tag={_tag} essayList={_essayList} showLoading={_showLoading}/>
    showDialog(true, COMMON_DIALOG_WRAPPER_ID, true, dialogContentElement, "Close", undefined)
}