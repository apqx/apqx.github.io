// 处理导航相关
import {MDCDialog} from "@material/dialog"
import {MDCTopAppBar} from "@material/top-app-bar"
import {MDCRipple} from "@material/ripple"
import {MDCDrawer} from "@material/drawer"
import {MDCList} from "@material/list"
import {MDCTextField} from "@material/textfield"
import {MDCLinearProgress} from "@material/linear-progress"
import {MDCIconButtonToggle} from "@material/icon-button";
import {showAlertDialog} from "./component/CommonAlertDialog"
import {showAboutMeDialog} from "./component/AboutMeDialog";

// Theme主题相关常量
const THEME_LIGHT = "0"
const THEME_DARK = "1"
const KEY_THEME = "theme"
// 搜索框的进度条
let searchDialogProgressbar = null

if (document.readyState !== "loading") {
    runOnStart()
} else {
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener("DOMContentLoaded", () => {
        runOnStart()
    })
}

// 初始化Chrome/Safari标题栏颜色，立即执行
checkThemeColor()

function runOnStart() {
    initTheme()
    initFab()
    initDrawer()
    initAboutMeDialog()
    initSearchDialog()
    initLink()
}


function initTheme() {
    try {
        const bodyE = document.getElementsByTagName("body")[0];
        const btnTheme = document.getElementById("topbar_btn_theme")
        const iconToggle = new MDCIconButtonToggle(btnTheme)
        if (isSavedThemeDark()) {
            bodyE.classList.add("dark");
            showThemeDark(true, iconToggle);
        } else {
            showThemeDark(false, iconToggle);
        }
        if (btnTheme != null) {
            btnTheme.addEventListener("click", () => {
                toggleTheme(bodyE, iconToggle)
            });
        }
        // 监听系统级主题变化，即系统和导航栏都可以控制主题变化，但是如果用户曾经在导航栏设置过主题，则不响应系统变化？？？
        // 暂不响应系统级主题变化
        // window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        //     var newSysTheme = e.matches ? "dark" : "light";
        //     console.log("system theme change to " + newSysTheme)
        //     var newSysThemeChangeToDark = newSysTheme == "dark"
        //     var isCurrentThemeDark = bodyE.classList.contains("dark")
        //     if(isCurrentThemeDark != newSysThemeChangeToDark) {
        //         // 响应系统的主题修改，即变化主题
        //         toggleTheme(bodyE, iconToggle)
        //     }
        // });

    } catch (e) {
        console.log("catch e = " + e.message);
    }
}

/**
 * 切换主题
 * @param {Element} bodyE
 * @param {MDCIconButtonToggle} iconToggle
 */
function toggleTheme(bodyE, iconToggle) {
    if (bodyE.classList.contains("dark")) {
        bodyE.classList.remove("dark")
        showThemeDark(false, iconToggle)
        saveTheme(false)
    } else {
        bodyE.classList.add("dark")
        showThemeDark(true, iconToggle)
        saveTheme(true)
    }
}

/**
 * 设置ThemeButton显示的图标，是否显示暗黑页面对应的要切换到亮色主题的图标
 *
 * @param {Boolean} dark
 * @param {MDCIconButtonToggle} iconToggle
 */
function showThemeDark(dark, iconToggle) {
    iconToggle.on = dark
    // 当切换主题的时候，检查是否需要修改theme-color
    // 目前不需要，只切换暗色、亮色主题，而设置的亮色theme-color在系统级暗色主题下无效，还不如直接交给浏览器去自动检测呢
    // checkBrowserColor(dark)
}

function isMobileOrTablet() {
    let check = false
    let agent = navigator.userAgent || navigator.vendor || window.opera
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4)))
        check = true
    console.log("isMobileOrTablet = " + check)
    return check
}

/**
 *
 * @param {Boolean} showThemeDark
 */
function checkThemeColor(showThemeDark) {
    if (isMobileOrTablet()) {
        // 在mobile或tablet设备上添加theme-color，无论是暗色还是亮色主题，都设置浏览器标题栏theme-color主题颜色为淡红色
        // 似乎检测不出iPad，不过没关系
        // <meta name="theme-color" content="#df696e" />
        setThemeColor("#df696e")
    } else {
        // 在desktop设备上，暗色和亮色主题下，分别设置theme-color为background，若不设置，Safari会自动使用检测到的background颜色作为theme-color
        // 但是在系统暗色主题下，设置亮色的theme-color是无效的，所以，也就没必要再区分设置了，直接由Safari自动检测就行了
        // if (showThemeDark) {
        //     setThemeColor("rgb(32, 33, 36)")
        // } else {
        //     setThemeColor("#f7f7f7")
        // }
    }
}

/**
 *
 * @param {String} color
 */
function setThemeColor(color) {
    console.log("setThemeColor " + color)
    let themeColorE = null
    for (const metaE of document.getElementsByTagName("meta")) {
        if (metaE.getAttribute("name") === "theme-color") {
            themeColorE = metaE
            break
        }
    }
    if (themeColorE == null) {
        themeColorE = document.createElement("meta")
        themeColorE.setAttribute("name", "theme-color")
        themeColorE.setAttribute("content", color)
        document.getElementsByTagName("head")[0].append(themeColorE)
    } else {
        themeColorE.setAttribute("content", color)

    }
}


/**
 * 本地是否保存了用户设置的暗色主题，默认是没有的，即默认是亮色主题
 */
function isSavedThemeDark() {
    let savedTheme = localStorage.getItem(KEY_THEME)
    return savedTheme === THEME_DARK
}

/**
 * 保存用户设置的主题
 * @param {Boolean} isDark 是否是暗色主题
 */
function saveTheme(isDark) {
    console.log("save theme, dark = " + isDark)
    if (isDark) {
        localStorage.setItem(KEY_THEME, THEME_DARK)
    } else {
        localStorage.setItem(KEY_THEME, THEME_LIGHT)
    }
}

/**
 * 初始化Floating Action Button，点击回到顶部
 */
function initFab() {
    // 为fab添加ripple动画
    try {
        const fabE = document.querySelector(".mdc-fab")
        if (fabE != null) {
            const fabRipple = new MDCRipple(fabE)
            // topAppBar监听长按，把当前页编码后的URL复制到剪切板上
            fabE.addEventListener("long-press", () => {
                console.log("long-press fab")
                showEncodedUrl()
            })
        }
    } catch (e) {
        console.log("fab catch e = " + e.message)
    }
    // 点击回到顶部
    try {
        const fabUp = document.getElementById("fabUp")
        fabUp.addEventListener("click", () => {
            console.log("click fab")
            scrollToTop()
        })
    } catch (e) {
        console.log("catch e = " + e.message)
    }
}

function showEncodedUrl() {
    const url = window.location.href
    const urlLink = "<a href=\"" + url + "\">Copy this link to get encoded url</a>"
    showAlertDialog("Encoded Url", urlLink , "OK", () => {
    })
}

function scrollToTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, c - c / 8)
    }
}


/**
 * 初始化Top app bar，Drawer
 */
function initDrawer() {
    let drawer
    try {
        const topAppBarE = document.querySelector(".mdc-top-app-bar")

        const topAppBar = new MDCTopAppBar(topAppBarE)
        // 监听menu按钮点击
        topAppBar.listen("MDCTopAppBar:nav", () => {
            drawer.open = !drawer.open
        })
        // 监听弹出Drawer
        const toggleDowers = document.querySelectorAll(".toggle-drawer")
        for (const toggle of toggleDowers) {
            toggle.addEventListener("click", () => {
                drawer.open = !drawer.open
            })
        }
        drawer = MDCDrawer.attachTo(document.querySelector(".mdc-drawer"))
        // drawer中的list
        const listEl = document.querySelector(".mdc-drawer .mdc-deprecated-list")
        const drawerList = new MDCList(listEl)
        const mainContentEl = document.querySelector(".main-content")
        const originalSelectedItem = drawerList.selectedIndex
        console.log("drawer originalSelectedItem " + originalSelectedItem)
        drawerList.listen("MDCList:action", (event) => {
            // 获取点击的item索引
            console.log("click drawer list item " + event.detail.index)
            // 点击会跳转到新的页面，但是当前页面应该保持，还原到原来的选中状态
            drawerList.selectedIndex = originalSelectedItem
            if (event.detail.index > 4) {
                // 点击了除 索引组 之外的item，关闭drawer
                drawer.open = false
            } else {
                // 点击了 索引组 的item，不要关闭Drawer，可能会因为页面跳转Drawer的状态无法还原成close，导致再退回到跳转前的页面时，drawer状态不对，无法打开drawer
            }
        })

    } catch (e) {
        console.log("catch e = " + e.message)
    }
}

/**
 * 初始化关于我dialog
 */
function initAboutMeDialog() {
    try {
        document.getElementById("topbar_btn_about_me").addEventListener("click", () => {
            // aboutMeDialog.open()
            showAboutMeDialog()
        })
        // 侧边导航的关于我
        document.getElementById("drawer-a-about-me").addEventListener("click", () => {
            // aboutMeDialog.open()
            showAboutMeDialog()
        })

    } catch (e) {
        console.log("catch e = " + e.message)
    }
}

/**
 * 初始化搜索Dialog
 * TODO: 切换搜索结果页的时候自动滚动到结果列表顶部
 */
function initSearchDialog() {
    searchDialogProgressbar = new MDCLinearProgress(document.getElementById("search-progress-bar"))
    searchDialogProgressbar.determinate = false
    searchDialogProgressbar.close()
    try {
        const searchDialog = new MDCDialog(document.getElementById("search_dialog"))
        const searchTextFieldE = document.getElementById("text-field-search")
        const searchTextField = new MDCTextField(searchTextFieldE)
        searchDialog.listen("MDCDialog:opened", () => {
            // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
            // 但是Button获取焦点后颜色会变化，所以立即取消焦点
            var btnCloseE = document.getElementById("search_dialog_btn_close")
            if (btnCloseE != null) {
                btnCloseE.focus()
                btnCloseE.blur()
            }
        })
        searchDialog.listen("MDCDialog:closing", () => {
            removeSearchResult()
            searchTextField.value = ""
        })
        // document.getElementById("topbar_btn_search").addEventListener("click", () => {
        //     console.log("click topbar search")
        //     searchDialog.open()
        // })
        // 侧边导航的搜索
        document.getElementById("drawer-a-search").addEventListener("click", () => {
            console.log("click nav search")
            searchDialog.open()
        })

        document.getElementById("btn_search").addEventListener("click", () => {
            checkToSearch(searchTextField.value)
        })
        searchTextFieldE.addEventListener("keyup", (event) => {
            if (event.key === "Enter")
                checkToSearch(searchTextField.value)

        })
    } catch (e) {
        console.log("catch e = " + e.message)
    }
}

/**
 *
 * @param {string} searchValue
 */
function checkToSearch(searchValue) {
    console.log("click search " + searchValue)

    if (searchValue !== "") {
        search(searchValue, 1)
    } else {
        removeSearchResult()
    }
}

/**
 *
 * @param {*} key 搜索关键字
 * @param {*} startIndex 每页10个，本次请求的起始索引，从1开始
 */
function search(key, startIndex) {
    const request = new Request("https://customsearch.googleapis.com/customsearch/v1?cx=b74f06c1723da9656&exactTerms=" +
        key + "&key=AIzaSyDYDqedqxaV6Qfv2i8OWpcS0phD-G2WDcg&start=" + startIndex, {
        method: "GET"
    })
    searchDialogProgressbar.open()
    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error("Something went wrong on api server!")
            }
        })
        .then(response => {
            console.debug(response)
            removeSearchResult()
            showSearchResult(response)
        }).catch(error => {
        console.error(error)
        removeSearchResult()
    })
}


function removeSearchResult() {
    searchDialogProgressbar.close()
    const searchResultWrapper = document.getElementById("search-result-wrapper")
    while (searchResultWrapper.firstChild) {
        searchResultWrapper.removeChild(searchResultWrapper.lastChild)
    }
}

function showSearchResult(response) {
    searchDialogProgressbar.close()
    // 搜索结果列表
    if (response.searchInformation.totalResults == 0) return
    const searchResultWrapper = document.getElementById("search-result-wrapper")
    const ulSearchResultList = document.createElement("ul")
    ulSearchResultList.setAttribute("class", "mdc-deprecated-list dialog-link-list")
    searchResultWrapper.appendChild(ulSearchResultList)
    let i = 0
    for (const resItem of response.items) {
        i++
        console.log("add result item = " + resItem.htmlTitle)
        ulSearchResultList.appendChild(generateListItem(resItem))

        if (i !== response.items.length) {
            const hrBottomDivider = document.createElement("hr")
            hrBottomDivider.setAttribute("class", "mdc-deprecated-list-divider")
            ulSearchResultList.appendChild(hrBottomDivider)
        }
    }
    // List的点击动画
    new MDCList(ulSearchResultList).listElements.map((listItemEl) => new MDCRipple(listItemEl))

    // 搜索结果索引，每页10个
    const totalPageNum = Math.ceil(response.searchInformation.totalResults / 10)
    const currentIndex = Math.ceil(response.queries.request[0].startIndex / 10)

    const {divResultNav, btnLeft, btnRight} = generateSearchResultNav(currentIndex, totalPageNum)

    searchResultWrapper.appendChild(divResultNav)

    // 上一页监听器
    btnLeft.addEventListener("click", () => {
        if (response.queries.previousPage != null && response.queries.previousPage.length != 0) {
            console.log("click search result left: " + response.queries.request[0].exactTerms + " " + response.queries.previousPage[0].startIndex)
            search(response.queries.request[0].exactTerms, response.queries.previousPage[0].startIndex)
        }
    })

    // 下一页监听器
    btnRight.addEventListener("click", () => {
        if (response.queries.nextPage != null && response.queries.nextPage.length != 0) {
            console.log("click search result right: " + response.queries.request[0].exactTerms + " " + response.queries.nextPage[0].startIndex)
            search(response.queries.request[0].exactTerms, response.queries.nextPage[0].startIndex)
        }
    })
    // document.getElementById("search-dialog-content").scrollIntoView()
}

function generateSearchResultNav(currentIndex, totalPageNum) {
    const divResultNav = document.createElement("div")
    divResultNav.setAttribute("class", "search-result-nav-wrapper")

    const btnLeft = generateSearchResultNavBtn(true)
    divResultNav.appendChild(btnLeft)

    const spanIndex = document.createElement("span")
    spanIndex.setAttribute("class", "search-result-index")
    spanIndex.innerHTML = currentIndex + "/" + totalPageNum
    divResultNav.appendChild(spanIndex)

    const btnRight = generateSearchResultNavBtn(false)
    divResultNav.appendChild(btnRight)
    return {divResultNav, btnLeft, btnRight}
}

function generateSearchResultNavBtn(left) {
    const btn = document.createElement("button")
    btn.setAttribute("class", "mdc-button btn-search-result-nav mdc-ripple-upgraded mdc-button--outlined")
    const spanRipple = document.createElement("span")
    spanRipple.setAttribute("class", "mdc-button__ripple")
    const i = document.createElement("i")
    i.setAttribute("class", "material-icons mdc-button__icon")
    i.setAttribute("aria-hidden", "true")
    i.innerHTML = left ? "chevron_left" : "chevron_right"
    const spanText = document.createElement("span")
    spanText.setAttribute("class", "mdc-button__label")
    spanText.innerHTML = left ? "上一页" : "下一页"
    btn.appendChild(spanRipple)
    if (left) {
        btn.appendChild(i)
        btn.appendChild(spanText)
    } else {
        btn.appendChild(spanText)
        btn.appendChild(i)
    }
    // 点击动画
    new MDCRipple(btn)
    return btn
}

function generateListItem(resItem) {
    const aListItem = document.createElement("a")
    aListItem.setAttribute("class", "mdc-deprecated-list-item search-result-item")
    aListItem.setAttribute("href", resItem.link)
    aListItem.setAttribute("target", "_blank")
    const spanRipple = document.createElement("span")
    spanRipple.setAttribute("class", "mdc-deprecated-list-item__ripple")
    aListItem.appendChild(spanRipple)

    const divItem = document.createElement("div")
    const spanTitle = document.createElement("h1")
    spanTitle.setAttribute("class", "search-result-item-title ")
    spanTitle.innerHTML = resItem.htmlTitle
    const spanSnippet = document.createElement("p")
    spanSnippet.setAttribute("class", "search-result-item-snippet")
    spanSnippet.innerHTML = resItem.htmlSnippet
    divItem.appendChild(spanTitle)
    divItem.appendChild(spanSnippet)
    aListItem.append(divItem)
    return aListItem
}

/**
 * 给指定的link添加扩展名
 */
function initLink() {
    const aList = document.getElementsByClassName("extension-txt")
    for (const a of aList) {
        const url = a.getAttribute("href") + ".txt"
        a.setAttribute("href", url)
    }
}

