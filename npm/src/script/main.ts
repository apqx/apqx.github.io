import {MDCRipple} from "@material/ripple"
import {MDCList} from "@material/list"
import {MDCDataTable} from "@material/data-table"
import hljs from "highlight.js/lib/core"
import "highlight.js/styles/atom-one-dark.css"
import {runOnHtmlDone} from "./util/Tools"
import {checkJump} from "./jump"
import {
    initAboutMeDialog,
    initDrawer,
    initFab,
    initHandwritingFont,
    initPreferenceDialog,
    initSearchDialog,
    initTheme
} from "./nav"
import {initTagTriggers} from "./tag"
import {initImg} from "./img"
import { LocalRepository } from "./repository/LocalRepository"

export var localRepository: LocalRepository = new LocalRepository()

runOnHtmlDone(() => {
    initHljs()
    initViews()
    initImg()
    checkJump()
    initTheme()
    initHandwritingFont()
    initFab()
    initDrawer()
    initPreferenceDialog()
    initSearchDialog()
    initAboutMeDialog()
    initTagTriggers()
})


function initHljs() {
    hljs.registerLanguage("bash", require("highlight.js/lib/languages/bash"))
    hljs.registerLanguage("c", require("highlight.js/lib/languages/c"))
    hljs.registerLanguage("csharp", require("highlight.js/lib/languages/csharp"))
    hljs.registerLanguage("cpp", require("highlight.js/lib/languages/cpp"))
    hljs.registerLanguage("css", require("highlight.js/lib/languages/css"))
    hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"))
    hljs.registerLanguage("json", require("highlight.js/lib/languages/json"))
    hljs.registerLanguage("java", require("highlight.js/lib/languages/java"))
    hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"))
    hljs.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"))
    hljs.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"))
    hljs.registerLanguage("python", require("highlight.js/lib/languages/python"))
    hljs.registerLanguage("ruby", require("highlight.js/lib/languages/ruby"))
    hljs.registerLanguage("rust", require("highlight.js/lib/languages/rust"))
    hljs.registerLanguage("scss", require("highlight.js/lib/languages/scss"))
    hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"))
    hljs.registerLanguage("shell", require("highlight.js/lib/languages/shell"))
    hljs.registerLanguage("swift", require("highlight.js/lib/languages/swift"))
    hljs.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"))
    hljs.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"))
    hljs.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"))
    hljs.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"))
    hljs.registerLanguage("http", require("highlight.js/lib/languages/http"))
    hljs.registerLanguage("dart", require("highlight.js/lib/languages/dart"))

    hljs.highlightAll()
    // document.querySelectorAll("div.highlighter-rouge").forEach(el => {
    //     hljs.highlightElement(el)
    //   })
}

function initViews() {
    // 为所有的button添加ripple动画，要与 mdc-button__ripple 配合使用才会生效
    for (const btn of document.querySelectorAll(".mdc-button")) {
        // TODO: Tag弹出Dialog的React操作似乎被点击Tag的Ripple动画所影响，慢一拍，取消动画就好了，或者按住一会，等动画完成后再松开
        // 浏览器似乎是单线程运行的
        new MDCRipple(btn)
    }

    for (const ele of document.querySelectorAll(".index-card")) {
        new MDCRipple(ele)
    }

    // list，很多样式效果要实例化才会生效，比如点击选中
    const lists = document.querySelectorAll(".mdc-deprecated-list")
    for (const list of lists) {
        const item = new MDCList(list)
        // 为每个item添加ripple动画
        item.listElements.map((listItemEl) => new MDCRipple(listItemEl))
    }

    // 数据表
    const dataTables = document.querySelectorAll(".mdc-data-table")
    for (const dataTableE of dataTables) {
        new MDCDataTable(dataTableE)
    }
}