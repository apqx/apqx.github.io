// 处理导航相关

import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from "@material/drawer";
import { MDCList } from '@material/list';
import { MDCTextField } from '@material/textfield';
import { MDCLinearProgress } from '@material/linear-progress';


try {
    
} catch (e) {
    console.log("catch e = " + e.message);
}

// 为fab添加ripple动画
try {
    const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));
} catch (e) {
    console.log("catch e = " + e.message);
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
try {
    const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
    // 监听menu按钮点击
    topAppBar.listen('MDCTopAppBar:nav', () => {
        console.log("click nav menu");
        drawer.open = !drawer.open;
    });
    const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    // drawer中的list
    const listEl = document.querySelector('.mdc-drawer .mdc-deprecated-list');
    const drawerList = new MDCList(listEl);
    const mainContentEl = document.querySelector('.main-content');
    const originalSelectedItem = drawerList.selectedIndex
    console.log("originalSelectedItem " + originalSelectedItem);
    drawerList.listen('MDCList:action', (event) => {
        drawer.open = false;
        // 获取点击的item索引
        console.log("click drawer list item " + event.detail.index);
        if (event.detail.index > 1) {
            // 点击了除 随笔 转载 之外的item，禁止选中，还原到原来的选中状态
            drawerList.selectedIndex = originalSelectedItem
        }
    });

} catch (e) {
    console.log("catch e = " + e.message);
}


// 关于我dialog
try {
    const aboutMeDialog = new MDCDialog(document.getElementById('about_me_dialog'));
    aboutMeDialog.listen('MDCDialog:opened', () => {
        // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
        // 但是Button获取焦点后颜色会变化，所以立即取消焦点
        document.getElementById('about_me_dialog_btn_close').focus();
        document.getElementById('about_me_dialog_btn_close').blur();
    });

    document.getElementById('topbar_btn_about_me').addEventListener('click', () => {
        console.log("click topbar about me");
        aboutMeDialog.open();
        // TODO: 在这里切换黑白主题
        // document.body.classList.toggle('dark');
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
        document.getElementById('search_dialog_btn_close').focus();
        document.getElementById('search_dialog_btn_close').blur();
    });
    searchDialog.listen('MDCDialog:closing', () => {
        removeSearchResult();
        searchTextField.value = "";
    });
    document.getElementById('topbar_btn_search').addEventListener('click', () => {
        console.log("click topbar search");
        searchDialog.open();
    });

    document.getElementById('btn_search').addEventListener('click', () => {
        console.log("click search " + searchTextField.value);
        console.log("host " + window.location.hostname);

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
        var aListItem = document.createElement('a');
        aListItem.setAttribute("class", `mdc-deprecated-list-item search-result-item`);
        aListItem.setAttribute("href", resItem.link);
        aListItem.setAttribute("target", `_blank`);
        var spanRipple = document.createElement('span');
        spanRipple.setAttribute("class", `mdc-deprecated-list-item__ripple`);
        aListItem.appendChild(spanRipple);

        var divItem = document.createElement(`div`);
        var spanTitle = document.createElement('h1');
        spanTitle.setAttribute("class", `search-result-item-title`);
        spanTitle.innerHTML = resItem.htmlTitle;
        var spanSnippet = document.createElement('p');
        spanSnippet.setAttribute("class", `search-result-item-snippet`);
        spanSnippet.innerHTML = resItem.htmlSnippet;
        divItem.appendChild(spanTitle);
        divItem.appendChild(spanSnippet);
        aListItem.append(divItem);

        ulSearchResultList.appendChild(aListItem);

        if (i != response.items.length) {
            var hrBottomDivider = document.createElement(`hr`);
            hrBottomDivider.setAttribute("class", `mdc-deprecated-list-divider`);
            ulSearchResultList.appendChild(hrBottomDivider);
        }
    }

    // 搜索结果索引，每页10个
    var totalPageNum = Math.ceil(response.searchInformation.totalResults / 10);
    var currentIndex = Math.ceil(response.queries.request[0].startIndex / 10);

    var divResultNav = document.createElement(`div`);
    divResultNav.setAttribute(`class`, `search-result-nav-wraper`);

    var btnLeft = document.createElement(`button`);
    btnLeft.setAttribute(`class`, `mdc-button btn-search-result-nav`);
    var spanLeftRipple = document.createElement(`span`);
    spanLeftRipple.setAttribute(`class`, `mdc-button__ripple`);
    var iLeft = document.createElement(`i`);
    iLeft.setAttribute(`class`, `material-icons mdc-button__icon`);
    iLeft.setAttribute(`aria-hidden`, `true`);
    iLeft.innerHTML = "chevron_left";
    var spanLeftText = document.createElement(`span`);
    spanLeftText.setAttribute(`class`, `mdc-button__label`);
    spanLeftText.innerHTML = "上一页";
    btnLeft.appendChild(spanLeftRipple);
    btnLeft.appendChild(iLeft);
    btnLeft.appendChild(spanLeftText);

    divResultNav.appendChild(btnLeft);


    var spanIndex = document.createElement(`span`);
    spanIndex.setAttribute(`class`, `search-result-index`);
    spanIndex.innerHTML = currentIndex + "/" + totalPageNum;
    divResultNav.appendChild(spanIndex);


    var btnRight = document.createElement(`button`);
    btnRight.setAttribute(`class`, `mdc-button btn-search-result-nav`);
    var spanRightRipple = document.createElement(`span`);
    spanRightRipple.setAttribute(`class`, `mdc-button__ripple`);
    var iRight = document.createElement(`i`);
    iRight.setAttribute(`class`, `material-icons mdc-button__icon`);
    iRight.setAttribute(`aria-hidden`, `true`);
    iRight.innerHTML = "chevron_right";
    var spanRightText = document.createElement(`span`);
    spanRightText.setAttribute(`class`, `mdc-button__label`);
    spanRightText.innerHTML = "下一页";
    btnRight.appendChild(spanRightRipple);
    btnRight.appendChild(spanRightText);
    btnRight.appendChild(iRight);

    divResultNav.appendChild(btnRight);

    searchResultWraper.appendChild(divResultNav);

    // 上一页监听器
    if (response.queries.previousPage != null && response.queries.previousPage.length != 0) {
        btnLeft.addEventListener('click', () => {
            console.log("click search result left: " + response.queries.request[0].exactTerms + " " + response.queries.previousPage[0].startIndex);
            search(response.queries.request[0].exactTerms, response.queries.previousPage[0].startIndex);
        });
    }

    // 下一页监听器
    if (response.queries.nextPage != null && response.queries.nextPage.length != 0) {
        btnRight.addEventListener('click', () => {
            console.log("click search result right: " + response.queries.request[0].exactTerms + " " + response.queries.nextPage[0].startIndex);
            search(response.queries.request[0].exactTerms, response.queries.nextPage[0].startIndex);
        });
    }
}


// 生成二维码

// 侧边导航的关于我
try {
    document.getElementById('drawer-a-about-me').addEventListener('click', () => {
        console.log("click nav about me");
        aboutMeDialog.open();
    });
} catch (e) {
    console.log("catch e = " + e.message);
}