import React, {Component} from "react";
import {showDialog} from "./BasicDialog";
import {MDCList} from "@material/list";
import {MDCRipple} from "@material/ripple";
import {MDCLinearProgress} from "@material/linear-progress";

class TagEssayListDialog extends Component {

    constructor(props) {
        super(props)
        console.log("TagEssayListDialog constructor")
    }


    componentDidMount() {
        console.log("TagEssayListDialog componentDidMount")
    }


    componentWillUnmount() {
        console.log("TagEssayListDialog componentWillUnmount")
    }

    initProgressbar(progressbarE) {
        console.log("initProgressbar " + progressbarE)
        if (progressbarE == null) return
        this.progressbar = new MDCLinearProgress(progressbarE)
        this.progressbar.determinate = false
        if (this.props.showLoading) {
            this.progressbar.open()
        } else {
            this.progressbar.close()
        }

    }

    initList(listE) {
        if (listE == null) return
        new MDCList(listE)
    }

    render() {
        console.log("TagEssayListDialog render")
        return (
            <div>
                <p className="mdc-theme--on-surface" >标记TAG
                    <code id="tag-dialog-tag-name"
                          className="language-plaintext highlighter-rouge">{this.props.tag}</code>
                    的<span>博文</span>
                </p>

                <div role="progressbar" className="mdc-linear-progress" aria-label="Example Progress Bar"
                     aria-valuemin="0"
                     aria-valuemax="1" aria-valuenow="0"
                     ref={e => this.initProgressbar(e)}>
                    <div className="mdc-linear-progress__buffer">
                        <div className="mdc-linear-progress__buffer-bar"></div>
                        <div className="mdc-linear-progress__buffer-dots"></div>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                        <span className="mdc-linear-progress__bar-inner"></span>
                    </div>
                    <div className="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                        <span className="mdc-linear-progress__bar-inner"></span>
                    </div>
                </div>

                <ul className="mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list"
                    ref={e => this.initList(e)}>
                    {this.props.essayList != undefined && this.props.essayList.map(item =>
                        <EssayItem
                            key={item.title + item.date}
                            url={item.url}
                            title={item.title}
                            date={item.date}
                            type={item.type}
                            block1Array={item.block1Array}
                            block2Array={item.block2Array}
                            isLastItem={this.props.essayList.indexOf(item) === (this.props.essayList.length - 1)}
                        />
                    )}

                </ul>
            </div>
        )
    }
}

class EssayItem extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
    }

    initRipple(e) {
        if (e == null) return
        new MDCRipple(e)
    }

    render() {
        return (
            <div>
                <a className="mdc-deprecated-list-item tag-list-item mdc-ripple-upgraded"
                   href={this.props.url}
                   ref={e => this.initRipple(e)}>
                    <span className="mdc-deprecated-list-item__ripple"></span>
                    <span className="mdc-deprecated-list-item__text">
                        <span className="my-list-item__primary-text">{this.props.title}</span>
                        <div className="my-list-item__secondary-text">
                            <span>{this.props.date}</span>
                            <span className="tag-essay-item-tags-container">
                                <span className="tag-essay-item-post-type">{this.props.type}</span>
                                {this.props.block1Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block1">{block}</span>
                                )}
                                {this.props.block2Array.map(block =>
                                    <span
                                        key={block}
                                        className="tag-essay-item-post-block2">{block}</span>
                                )}
                            </span>
                        </div>
                    </span>
                </a>
                {!this.props.isLastItem && <hr className="mdc-deprecated-list-divider"/>}
            </div>
        )
    }
}


/**
 *
 * @param {string} _tag
 * [
 *     {
 *         url: "",
 *         title: "",
 *         date: "",
 *         type: "",
 *         block1Array: [""],
 *         block2Array: [""]
 *     },
 * ]
 * @param {array} _essayList
 * @param {boolean} _showLoading
 */
export function showTagEssayListDialog(_tag, _essayList, _showLoading) {
    const dialogContentElement = <TagEssayListDialog tag={_tag} essayList={_essayList} showLoading={_showLoading}/>
    showDialog(true, dialogContentElement, "Close", undefined)
}
