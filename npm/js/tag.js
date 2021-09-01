// 处理文章的tag标记

import { MDCList } from '@material/list';
import { MDCDialog } from '@material/dialog';
import { MDCLinearProgress } from '@material/linear-progress';

const POST_TYPE_ORIGINAL = ["original", "随笔"];
const POST_TYPE_REPOST = ["repost", "转载"];
const POST_TYPE_POETRY = ["poetry", "诗文"];
const POST_TYPE_OPERA = ["opera", "观剧记录"];


// tag对应的Dialog
// 获取每一个标记了dialog-trigger的element，查找这个trigger对应的dialog，监听点击事件，弹出dialog
var dialogsTriggers = document.querySelectorAll('.dialog-trigger');

// try {
//     for (const triger of dialogsTriggers) {
//         // 获取每一个triger的id，找到它对应的dialogId，和dialog里的listId
//         // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
//         const dialogId = triger.id.replace("chip_tag_", "dialog_tag_");
//         const listId = triger.id.replace("chip_tag_", "dialog_tag_list_");
//         const btnId = triger.id.replace("chip_tag_", "btn_tag_dialog_close_");
//         console.log(triger.id + " : " + dialogId + " : " + listId);
//         // 监听trigger的点击事件
//         triger.addEventListener('click', () => {
//             console.log("click tag " + triger.id);
//             const dialog = new MDCDialog(document.getElementById(dialogId));
//             dialog.open();
//             const listEl = document.getElementById(listId);
//             const list = new MDCList(listEl);
//             // 监听dialog的弹出事件
//             dialog.listen('MDCDialog:opened', () => {
//                 console.log("tag dialog opened " + triger.id);
//                 // list.layout();
//                 // Dialog弹出时似乎Button获取了焦点，应该取消
//                 document.getElementById(btnId).blur();
//             });
//             // 点击列表中的item后，关闭Dialog
//             list.listen('MDCList:action', (event) => {
//                 console.log("click tagList item");
//                 dialog.close();
//             });
//         });
//     }
// } catch (e) {
//     console.log("tag catche e = " + e.message);
// }
const dialogMap = new Map();
const progressbarMap = new Map();

// 为每一个tag动态生成dialog
for (const triger of dialogsTriggers) {
    // 获取每一个triger的id，找到它对应的dialogId，和dialog里的listId
    // chip_tag_随笔 dialog_tag_随笔 dialog_tag_list_随笔
    const dialogId = triger.id.replace("chip_tag_", "dialog_tag_");
    const listId = triger.id.replace("chip_tag_", "dialog_tag_list_");
    const progressId = triger.id.replace("chip_tag_", "dialog_tag_progress_");
    const btnId = triger.id.replace("chip_tag_", "btn_tag_dialog_close_");
    const tag = triger.id.replace("chip_tag_", "");
    const postType = getPostType();
    console.log(triger.id + " : " + dialogId + " : " + listId);
    // 监听trigger的点击事件
    triger.addEventListener('click', () => {
        console.log("click tag " + triger.id);
        var dialogE = document.getElementById(dialogId);
        if (dialogE == null) {
            dialogE = generateTagDialog(tag, dialogId, listId, btnId, progressId, postType);
            // 把生成的Dialog插入到指定位置
            document.getElementById("tag_dialog_container").appendChild(dialogE);
        }
        var dialog;
        var progressbar;
        if (dialogMap.has(dialogId)) {
            dialog = dialogMap.get(dialogId);
            progressbar = progressbarMap.get(dialogId);
        } else {
            dialog = new MDCDialog(dialogE);
            dialogMap.set(dialogId, dialog);
            progressbar = new MDCLinearProgress(document.getElementById(progressId));
            progressbar.determinate = false;
            progressbar.close();
            progressbarMap.set(dialogId, progressbar);

            var listEl = document.getElementById(listId);
            var list = new MDCList(listEl);
            // 监听dialog的弹出事件
            dialog.listen('MDCDialog:opened', () => {
                console.log("tag dialog opened " + triger.id);
                // list.layout();
                // Dialog弹出时似乎List获取了焦点，应该取消
                // 先让Button获取焦点再取消，以转移焦点
                document.getElementById(btnId).focus();
                document.getElementById(btnId).blur();
            });
            // 点击列表中的item后，关闭Dialog
            list.listen('MDCList:action', (event) => {
                console.log("click tagList item");
                // dialog.close();
            });
        }
        dialog.open();
        // 请求该tag对应的文章列表
        if (document.getElementById(listId).childElementCount == 0) {
            // 只在无数据时请求
            queryTagItemList(tag, listId, postType, progressbar);
        }
        // var observer = new WebKitMutationObserver(function(mutations) {
        //     console.log("add node")
        // });
        // observer.observe(listEl, {
        //     childList: true
        // });


    });
}

function getPostType() {
    if (window.location.href.includes("/" + POST_TYPE_ORIGINAL[0] + "/")) {
        return POST_TYPE_ORIGINAL;
    } else if (window.location.href.includes("/" + POST_TYPE_REPOST[0] + "/")) {
        return POST_TYPE_REPOST;
    } else if (window.location.href.includes("/" + POST_TYPE_POETRY[0] + "/")) {
        return POST_TYPE_POETRY;
    } else if (window.location.href.includes("/" + POST_TYPE_OPERA[0] + "/")) {
        return POST_TYPE_OPERA;
    } else {
        return ["", ""];
    }
}

// 生成Dialog
function generateTagDialog(tag, dialogId, listId, btnId, progressId, postType) {
    /*
    <div class="mdc-dialog" id="dialog_tag_昆曲">
        <div class="mdc-dialog__container">
            <!-- 加上width500px后满足要求 -->
            <div class="mdc-dialog__surface common-dialog-container" role="alertdialog" aria-modal="true"
                aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content">
            
                <div class="mdc-dialog__content" id="my-dialog-content">
                    <p class="mdc-theme--on-surface">标记TAG <code class="language-plaintext highlighter-rouge">#AirPlay</code>的<span>博文</span></p>

                    <!-- 进度条 -->
                    <div role="progressbar" class="mdc-linear-progress" aria-label="Example Progress Bar" aria-valuemin="0"
                        aria-valuemax="1" aria-valuenow="0" id="dialog_tag_progress_AirPlay">
                        <div class="mdc-linear-progress__buffer">
                            <div class="mdc-linear-progress__buffer-bar"></div>
                            <div class="mdc-linear-progress__buffer-dots"></div>
                        </div>
                        <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                        </div>
                        <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                        </div>
                    </div>

                    <ul class="mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list"
                      id="dialog_tag_list_AirPlay">
                      <a class="mdc-deprecated-list-item" href="/post/original/2021/08/15/%E6%A0%91%E8%8E%93%E6%B4%BE%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96%E4%B8%8EAirPlay.html">
                        <span class="mdc-deprecated-list-item__ripple"></span>
                        <span class="mdc-deprecated-list-item__text">
                          <span class="mdc-deprecated-list-item__primary-text">树莓派的初始化与AirPlay</span>
                          <span class="mdc-deprecated-list-item__secondary-text">2021.08.15
                          </span>
                        </span>
                      </a>
                    </ul>
                </div>

                <div class="mdc-dialog__actions">
                  <button type="button" class="mdc-button btn-common mdc-button--unelevated center-horizontal"
                    style="width: 94%; margin-bottom: 1rem;" data-mdc-dialog-action="cancel"
                    id="btn_tag_dialog_close_刺虎">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">CLOSE</span>
                  </button>
                </div>

            </div>
        </div>
        <div class="mdc-dialog__scrim"></div>
    </div>
    */
    var divDialog = document.createElement("div");
    divDialog.setAttribute("class", "mdc-dialog");
    divDialog.setAttribute("id", dialogId);
    var divDialogContainer = document.createElement("div");
    divDialogContainer.setAttribute("class", "mdc-dialog__container");
    divDialog.appendChild(divDialogContainer);

    var divDialogSurface = document.createElement("div");
    divDialogSurface.setAttribute("class", "mdc-dialog__surface common-dialog-container");
    divDialogSurface.setAttribute("role", "alertdialog");
    divDialogSurface.setAttribute("aria-modal", "true");
    divDialogSurface.setAttribute("aria-labelledby", "my-dialog-title");
    divDialogSurface.setAttribute("aria-describedby", "my-dialog-content");
    divDialogContainer.appendChild(divDialogSurface);

    var divDialogContent = document.createElement("div");
    divDialogContent.setAttribute("class", "mdc-dialog__content");
    divDialogContent.setAttribute("id", "my-dialog-content");
    var pTitle = document.createElement("p");
    pTitle.setAttribute("class", "mdc-theme--on-surface");
    pTitle.innerHTML = "标记TAG <code class=\"language-plaintext highlighter-rouge\">#" + tag + "</code> 的<span>" + postType[1] + "</span>"
    divDialogContent.appendChild(pTitle);

    var divProgressbar = generateProgressbar(progressId);
    divDialogContent.appendChild(divProgressbar);

    var ulList = document.createElement("ul");
    ulList.setAttribute("class", "mdc-deprecated-list mdc-deprecated-list--two-line dialog-link-list");
    ulList.setAttribute("id", listId);
    divDialogContent.appendChild(ulList);
    divDialogSurface.appendChild(divDialogContent);

    var divActions = document.createElement("div");
    divActions.setAttribute("class", "mdc-dialog__actions");
    var btnClose = document.createElement("button");
    btnClose.setAttribute("type", "button");
    btnClose.setAttribute("class", "mdc-button btn-common mdc-button--unelevated center-horizontal");
    btnClose.setAttribute("style", "width: 94%; margin-bottom: 1rem;");
    btnClose.setAttribute("data-mdc-dialog-action", "cancel");
    btnClose.setAttribute("id", btnId);
    var divBtnCloseRipple = document.createElement("div");
    divBtnCloseRipple.setAttribute("class", "mdc-button__ripple");
    btnClose.appendChild(divBtnCloseRipple);
    var spanBtnClose = document.createElement("span");
    spanBtnClose.setAttribute("class", "mdc-button__label");
    spanBtnClose.innerHTML = "CLOSE";
    btnClose.appendChild(spanBtnClose);

    divActions.appendChild(btnClose);
    divDialogSurface.appendChild(divActions);

    var divScrim = document.createElement("div");
    divScrim.setAttribute("class", "mdc-dialog__scrim");
    divDialog.appendChild(divScrim);

    return divDialog;
}

function generateProgressbar(progressId) {
    var divProgressbar = document.createElement("div");
    divProgressbar.setAttribute("role", "progressbar");
    divProgressbar.setAttribute("class", "mdc-linear-progress");
    divProgressbar.setAttribute("aria-label", "Example Progress Bar");
    divProgressbar.setAttribute("aria-valuemin", "0");
    divProgressbar.setAttribute("aria-valuemax", "1");
    divProgressbar.setAttribute("aria-valuenow", "0");
    divProgressbar.setAttribute("id", progressId);
    var divProgressbarBuffer = document.createElement("div");
    divProgressbarBuffer.setAttribute("class", "mdc-linear-progress__buffer");
    var divProgressbarBufferBar = document.createElement("div");
    divProgressbarBufferBar.setAttribute("class", "mdc-linear-progress__buffer-bar");
    divProgressbarBuffer.appendChild(divProgressbarBufferBar);
    var divProgressbarBufferDots = document.createElement("div");
    divProgressbarBufferDots.setAttribute("class", "mdc-linear-progress__buffer-dots");
    divProgressbarBuffer.appendChild(divProgressbarBufferDots);
    divProgressbar.appendChild(divProgressbarBuffer);

    var divProgressbarPrimary = document.createElement("div");
    divProgressbarPrimary.setAttribute("class", "mdc-linear-progress__bar mdc-linear-progress__primary-bar");
    var spanProgressbarPrimary = document.createElement("span");
    spanProgressbarPrimary.setAttribute("class", "mdc-linear-progress__bar-inner");
    divProgressbarPrimary.appendChild(spanProgressbarPrimary);
    divProgressbar.appendChild(divProgressbarPrimary);

    var divProgressbarSecondary = document.createElement("div");
    divProgressbarSecondary.setAttribute("class", "mdc-linear-progress__bar mdc-linear-progress__secondary-bar");
    var spanProgressbarSecondary = document.createElement("span");
    spanProgressbarSecondary.setAttribute("class", "mdc-linear-progress__bar-inner");
    divProgressbarSecondary.appendChild(spanProgressbarSecondary);
    divProgressbar.appendChild(divProgressbarSecondary);
    return divProgressbar;
}

/**
 * 
 * @param {*} tag 未处理的标签，url种的tag需要进行一些处理：小写，部分字符用 - 代替
 * @param {*} listId 要填充的列表id
 * @param {*} postType 文章类型：original, repost, poetry, opera
 */
function queryTagItemList(tag, listId, postType, progressbar) {
    var host = window.location.host;
    if (host.includes("localhost")) {
        host = "http://" + host;
    } else {
        host = "https://" + host;
    }
    var url = host + "/archive/tag/" + tag.replace("·", "-") + "/index.html";
    console.log("queryTagItemList " + url);
    const request = new Request(url, {
        method: 'GET'
    });
    progressbar.open();
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text();
            } else {
                throw new Error('Something went wrong on api server!');
            }
        })
        .then(response => {
            console.debug(response);
            progressbar.close();
            showTagItemList(JSON.parse(response), listId, postType);
        }).catch(error => {
            console.error(error);
            progressbar.close();
        });
}

function showTagItemList(response, listId, postType) {
    var ulList = document.getElementById(listId);
    var firstItem = true;
    for (var item of response.items) {
        // 只填充同一个postType的文章
        if (!item.url.includes("/" + postType[0] + "/")) {
            continue;
        }

        // 除第一个外，每一个item之前都要添加divider分割线
        if (firstItem) {
            firstItem = false;
        } else {
            ulList.appendChild(generateDivider());
        }
        ulList.appendChild(generateItem(item, postType));
    }
    // ulList.innerHTML = response;
    // 填充后，似乎是list获得了焦点，应该取消
    // document.getElementById(listId).blur();

}

function generateDivider() {
    // <hr class="mdc-deprecated-list-divider"></hr>
    var hr = document.createElement("hr");
    hr.setAttribute("class", "mdc-deprecated-list-divider");
    return hr;
}

function generateItem(item, postType) {
    var a = document.createElement("a");
    a.setAttribute("class", "mdc-deprecated-list-item");
    a.setAttribute("href", item.url);
    var spanRipple = document.createElement("span");
    spanRipple.setAttribute("class", "mdc-deprecated-list-item__ripple");
    a.appendChild(spanRipple);

    var spanText = document.createElement("span");
    spanText.setAttribute("class", "mdc-deprecated-list-item__text");
    var spanTextPrimary = document.createElement("span");
    spanTextPrimary.setAttribute("class", "mdc-deprecated-list-item__primary-text");
    spanTextPrimary.innerHTML = item.title;
    spanText.appendChild(spanTextPrimary);
    var spanTextScondary = document.createElement("span");
    spanTextScondary.setAttribute("class", "mdc-deprecated-list-item__secondary-text");
    spanTextScondary.innerHTML = item.date + " ";
    // var spanTextPostType = document.createElement("span");
    // spanTextPostType.innerHTML = postType[1];
    // spanTextScondary.appendChild(spanTextPostType);

    spanText.appendChild(spanTextScondary);

    a.appendChild(spanText);

    return a;
}
