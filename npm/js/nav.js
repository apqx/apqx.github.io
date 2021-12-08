// 处理导航相关

import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from "@material/drawer";
import { MDCList } from '@material/list';
import { MDCTextField } from '@material/textfield';
import { MDCLinearProgress } from '@material/linear-progress';


// 为fab添加ripple动画
try {
    var fabE = document.querySelector('.mdc-fab');
    if (fabE != null) {
        const fabRipple = new MDCRipple(fabE);
    }
} catch (e) {
    console.log("fab catch e = " + e.message);
}

try {
    const fabUp = document.getElementById('fabUp');
    fabUp.addEventListener('click', () => {
        console.log("click fab");
    });
} catch (e) {
    console.log("catch e = " + e.message);
}
// top app bar, drawer
var drawer;
try {
    const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
    // 监听menu按钮点击
    topAppBar.listen('MDCTopAppBar:nav', () => {
        console.log("click nav menu " + drawer.open);
        drawer.open = !drawer.open;
    });
    drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    // drawer中的list
    const listEl = document.querySelector('.mdc-drawer .mdc-deprecated-list');
    const drawerList = new MDCList(listEl);
    const mainContentEl = document.querySelector('.main-content');
    const originalSelectedItem = drawerList.selectedIndex
    console.log("originalSelectedItem " + originalSelectedItem);
    drawerList.listen('MDCList:action', (event) => {
        // 获取点击的item索引
        console.log("click drawer list item " + event.detail.index);
        // 点击会跳转到新的页面，但是当前页面应该保持，还原到原来的选中状态
        drawerList.selectedIndex = originalSelectedItem
        if (event.detail.index > 4) {
            // 点击了除 索引组 之外的item，关闭drawer
            drawer.open = false;
        } else {
            // 点击了 索引组 的item，不要关闭Drawer，可能会因为页面跳转Deawer的状态无法还原成close，导致再退回到跳转前的页面时，drawer状态不对，无法打开drawer
        }
    });

} catch (e) {
    console.log("catch e = " + e.message);
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// 关于我dialog
try {
    const aboutMeDialog = new MDCDialog(document.getElementById('about_me_dialog'));
    aboutMeDialog.listen('MDCDialog:opened', () => {
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        var btnCloseE = document.getElementById('about_me_dialog_btn_close');
        if (btnCloseE != null) {
            btnCloseE.focus();
            btnCloseE.blur();
        }
    });

    document.getElementById('topbar_btn_about_me').addEventListener('click', () => {
        console.log("click topbar about me");
        aboutMeDialog.open();
        // TODO: 在这里切换黑白主题
        // document.body.classList.toggle('dark');
    });
    // 侧边导航的关于我
    document.getElementById('drawer-a-about-me').addEventListener('click', () => {
        console.log("click nav about me");
        aboutMeDialog.open();
    });

} catch (e) {
    console.log("catch e = " + e.message);
}

// 搜索dialog
const searchLinearProgress = new MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
searchLinearProgress.determinate = false;
searchLinearProgress.close();
try {
    const searchDialog = new MDCDialog(document.getElementById('search_dialog'));
    const searchTextField = new MDCTextField(document.getElementById('text-field-search'));
    searchDialog.listen('MDCDialog:opened', () => {
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        var btnCloseE = document.getElementById('search_dialog_btn_close');
        if (btnCloseE != null) {
            btnCloseE.focus();
            btnCloseE.blur();
        }
    });
    searchDialog.listen('MDCDialog:closing', () => {
        removeSearchResult();
        searchTextField.value = "";
    });
    // document.getElementById('topbar_btn_search').addEventListener('click', () => {
    //     console.log("click topbar search");
    //     searchDialog.open();
    // });
    // 侧边导航的搜索
    document.getElementById('drawer-a-search').addEventListener('click', () => {
        console.log("click nav search");
        searchDialog.open();
    });

    document.getElementById('btn_search').addEventListener('click', () => {
        console.log("click search " + searchTextField.value);

        if (searchTextField.value != "") {
            search(searchTextField.value, 1);
        } else {
            removeSearchResult();
        }

    });
} catch (e) {
    console.log("catch e = " + e.message);
}

/**
 * 
 * @param {*} key 搜索关键字
 * @param {*} startIndex 每页10个，本次请求的起始索引，从1开始
 */
function search(key, startIndex) {
    const request = new Request('https://customsearch.googleapis.com/customsearch/v1?cx=b74f06c1723da9656&exactTerms=' + key + '&key=AIzaSyDYDqedqxaV6Qfv2i8OWpcS0phD-G2WDcg&start=' + startIndex, {
        method: 'GET'
    });
    searchLinearProgress.open();
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Something went wrong on api server!');
            }
        })
        .then(response => {
            console.debug(response);
            removeSearchResult();
            showSearchResult(response);
        }).catch(error => {
            console.error(error);
            removeSearchResult();
        });
}


function removeSearchResult() {
    searchLinearProgress.close();
    var searchResultWraper = document.getElementById(`search-result-wraper`);
    while (searchResultWraper.firstChild) {
        searchResultWraper.removeChild(searchResultWraper.lastChild);
    }
}

function showSearchResult(response) {
    searchLinearProgress.close();
    // 搜索结果列表
    if (response.searchInformation.totalResults == 0) return;
    var searchResultWraper = document.getElementById(`search-result-wraper`);
    var ulSearchResultList = document.createElement('ul');
    ulSearchResultList.setAttribute("class", `mdc-deprecated-list dialog-link-list`);
    searchResultWraper.appendChild(ulSearchResultList);
    var i = 0;
    for (const resItem of response.items) {
        i++;
        console.log("add result item = " + resItem.htmlTitle);
        ulSearchResultList.appendChild(generateListItem(resItem));

        if (i != response.items.length) {
            var hrBottomDivider = document.createElement(`hr`);
            hrBottomDivider.setAttribute("class", `mdc-deprecated-list-divider`);
            ulSearchResultList.appendChild(hrBottomDivider);
        }
    }
    // List的点击动画
    new MDCList(ulSearchResultList).listElements.map((listItemEl) => new MDCRipple(listItemEl));

    // 搜索结果索引，每页10个
    var totalPageNum = Math.ceil(response.searchInformation.totalResults / 10);
    var currentIndex = Math.ceil(response.queries.request[0].startIndex / 10);

    var { divResultNav, btnLeft, btnRight } = generateSearchResultNav(currentIndex, totalPageNum);

    searchResultWraper.appendChild(divResultNav);

    // 上一页监听器
    btnLeft.addEventListener('click', () => {
        if (response.queries.previousPage != null && response.queries.previousPage.length != 0) {
            console.log("click search result left: " + response.queries.request[0].exactTerms + " " + response.queries.previousPage[0].startIndex);
            search(response.queries.request[0].exactTerms, response.queries.previousPage[0].startIndex);
        }
    });

    // 下一页监听器
    btnRight.addEventListener('click', () => {
        if (response.queries.nextPage != null && response.queries.nextPage.length != 0) {
            console.log("click search result right: " + response.queries.request[0].exactTerms + " " + response.queries.nextPage[0].startIndex);
            search(response.queries.request[0].exactTerms, response.queries.nextPage[0].startIndex);
        }
    });
}

function generateSearchResultNav(currentIndex, totalPageNum) {
    var divResultNav = document.createElement(`div`);
    divResultNav.setAttribute(`class`, `search-result-nav-wraper`);

    var btnLeft = generateSearchResultNavBtn(true);
    divResultNav.appendChild(btnLeft);

    var spanIndex = document.createElement(`span`);
    spanIndex.setAttribute(`class`, `search-result-index`);
    spanIndex.innerHTML = currentIndex + "/" + totalPageNum;
    divResultNav.appendChild(spanIndex);

    var btnRight = generateSearchResultNavBtn(false);
    divResultNav.appendChild(btnRight);
    return { divResultNav, btnLeft, btnRight };
}

function generateSearchResultNavBtn(left) {
    var btn = document.createElement(`button`);
    btn.setAttribute(`class`, `mdc-button btn-search-result-nav mdc-ripple-upgraded mdc-button--outlined mdc-button--unelevated`);
    var spanRipple = document.createElement(`span`);
    spanRipple.setAttribute(`class`, `mdc-button__ripple`);
    var i = document.createElement(`i`);
    i.setAttribute(`class`, `material-icons mdc-button__icon`);
    i.setAttribute(`aria-hidden`, `true`);
    i.innerHTML = left ? "chevron_left" : "chevron_right";
    var spanText = document.createElement(`span`);
    spanText.setAttribute(`class`, `mdc-button__label`);
    spanText.innerHTML = left ? "上一页" : "下一页";
    btn.appendChild(spanRipple);
    if (left) {
        btn.appendChild(i);
        btn.appendChild(spanText);
    } else {
        btn.appendChild(spanText);
        btn.appendChild(i);
    }
    // 点击动画
    new MDCRipple(btn);
    return btn;
}

function generateListItem(resItem) {
    var aListItem = document.createElement('a');
    aListItem.setAttribute("class", `mdc-deprecated-list-item search-result-item`);
    aListItem.setAttribute("href", resItem.link);
    aListItem.setAttribute("target", `_blank`);
    var spanRipple = document.createElement('span');
    spanRipple.setAttribute("class", `mdc-deprecated-list-item__ripple`);
    aListItem.appendChild(spanRipple);

    var divItem = document.createElement(`div`);
    var spanTitle = document.createElement('h1');
    spanTitle.setAttribute("class", `search-result-item-title `);
    spanTitle.innerHTML = resItem.htmlTitle;
    var spanSnippet = document.createElement('p');
    spanSnippet.setAttribute("class", `search-result-item-snippet`);
    spanSnippet.innerHTML = resItem.htmlSnippet;
    divItem.appendChild(spanTitle);
    divItem.appendChild(spanSnippet);
    aListItem.append(divItem);
    return aListItem;
}

