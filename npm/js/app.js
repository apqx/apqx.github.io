import { MDCRipple } from '@material/ripple'
import { MDCChipSet } from '@material/chips/chip-set'
import { MDCList } from '@material/list'
import { MDCDataTable } from '@material/data-table'
import hljs from 'highlight.js/lib/core'
// import hljs from 'highlight.js'
import 'highlight.js/styles/androidstudio.css'

// 整个页面已经加载完成，包括CSS等外部资源
window.addEventListener('load', () => {

})
// 监听HTML元素加载完成的DOMContentLoaded事件，但是有时候该事件会在设置监听器之前完成，所以这里检查一下是否已经完成了
if (document.readyState !== 'loading') {
    console.log("DOMContentLoaded ready before addListener, just init")
    runOnStart()
} else {
    console.log("DOMContentLoaded not ready before addListener, so add listener")
    // HTML元素加载完成，但是CSS等资源还未加载
    document.addEventListener('DOMContentLoaded', (event) => {
        console.log("DOMContentLoaded listener get called, so start init")
        runOnStart()
    })
}

// 初始化Chrome/Safari标题栏颜色，立即执行
checkBroswerColor()

function runOnStart() {
    initHljs()
    initViews()
    checkBroswerColor()
}

function initHljs() {
    hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
    hljs.registerLanguage('c', require('highlight.js/lib/languages/c'))
    hljs.registerLanguage('csharp', require('highlight.js/lib/languages/csharp'))
    hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'))
    hljs.registerLanguage('css', require('highlight.js/lib/languages/css'))
    hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
    hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))
    hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
    hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
    hljs.registerLanguage('kotlin', require('highlight.js/lib/languages/kotlin'))
    hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'))
    hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
    hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'))
    hljs.registerLanguage('rust', require('highlight.js/lib/languages/rust'))
    hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'))
    hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))
    hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
    hljs.registerLanguage('swift', require('highlight.js/lib/languages/swift'))
    hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript'))
    hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'))
    hljs.registerLanguage('groovy', require('highlight.js/lib/languages/groovy'))
    hljs.registerLanguage('gradle', require('highlight.js/lib/languages/gradle'))
    hljs.registerLanguage('http', require('highlight.js/lib/languages/http'))
    hljs.registerLanguage('dart', require('highlight.js/lib/languages/dart'))

    hljs.highlightAll()
    // document.querySelectorAll('div.highlighter-rouge').forEach(el => {
    //     hljs.highlightElement(el)
    //   })
}

function initViews() {
    // 为所有的button添加ripple动画，要与 mdc-button__ripple 配合使用才会生效
    for (const btn of document.querySelectorAll('.mdc-button')) {
        btn.addEventListener('click', () => {
            console.log("click btn")
        })
        new MDCRipple(btn)
    }

    for (const iconBtn of document.querySelectorAll('.mdc-icon-button')) {
        iconBtn.addEventListener('click', () => {
            console.log("click icon btn")
        })
        // 这里不能再设置MDCRipple
        // new MDCRipple(iconBtn).unbounded = false
    }

    // 初始化chipSet
    var chipsetEs = document.querySelectorAll('.mdc-evolution-chip-set')
    for (let chipSetE of chipsetEs) {
        new MDCChipSet(chipSetE)
    }
    // 为chip添加ripple动画
    const chipActions = document.querySelectorAll('.mdc-evolution-chip__action')
    for (let chip of chipActions) {
        new MDCRipple(chip)
    }


    // list，很多样式效果要实例化才会生效，比如点击选中
    const lists = document.querySelectorAll('.mdc-deprecated-list')
    for (const list of lists) {
        const item = new MDCList(list)
        // 为每个item添加ripple动画
        item.listElements.map((listItemEl) => new MDCRipple(listItemEl))
    }

    // 数据表
    const dataTables = document.querySelectorAll('.mdc-data-table')
    for (const dataTableE of dataTables) {
        const item = new MDCDataTable(dataTableE)
    }
}

function isMobileOrTablet() {
    var check = false
    var agent = navigator.userAgent || navigator.vendor || window.opera
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) || 
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4)))
        check = true
    return check
}
function checkBroswerColor() {
    // 只在mobile或tablet设备上添加theme-color
    // 似乎检测不出iPad，不过没关系
    console.log("isMobileOrTablet = " + isMobileOrTablet())
    if (isMobileOrTablet()) {
        // <meta name="theme-color" content="#df696e" />
        var themeColorE = document.createElement('meta')
        themeColorE.setAttribute("name", "theme-color")
        themeColorE.setAttribute("content", "#df696e")
        document.getElementsByTagName('head')[0].append(themeColorE)
    }
}



