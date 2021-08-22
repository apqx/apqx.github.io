import { MDCRipple } from '@material/ripple';
import { MDCChipSet } from '@material/chips/chip-set';
import { MDCList } from '@material/list';
import { MDCDataTable } from '@material/data-table';
import hljs from 'highlight.js/lib/core';
// import hljs from 'highlight.js';
import 'highlight.js/styles/androidstudio.css';


hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('c', require('highlight.js/lib/languages/c'));
hljs.registerLanguage('csharp', require('highlight.js/lib/languages/csharp'));
hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('kotlin', require('highlight.js/lib/languages/kotlin'));
hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'));
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('rust', require('highlight.js/lib/languages/rust'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'));
hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'));
hljs.registerLanguage('swift', require('highlight.js/lib/languages/swift'));
hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript'));
hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'));
hljs.registerLanguage('groovy', require('highlight.js/lib/languages/groovy'));
hljs.registerLanguage('gradle', require('highlight.js/lib/languages/gradle'));
hljs.registerLanguage('http', require('highlight.js/lib/languages/http'));
hljs.registerLanguage('dart', require('highlight.js/lib/languages/dart'));

hljs.highlightAll();

// document.querySelectorAll('div.highlighter-rouge').forEach(el => {
//     hljs.highlightElement(el);
//   });

// 为所有的button添加ripple动画，要与 mdc-button__ripple 配合使用才会生效
for (const btn of document.querySelectorAll('.mdc-button')) {
    btn.addEventListener('click', () => {
        console.log("click btn")
    });
    const btnRipple = new MDCRipple(btn);
}


// 初始化chipSet
var chipsetEs = document.querySelectorAll('.mdc-evolution-chip-set');
for (let chipSetE of chipsetEs) {
    new MDCChipSet(chipSetE);
}
// 为chip添加ripple动画
const chipActions = document.querySelectorAll('.mdc-evolution-chip__action');
for (let chip of chipActions) {
    new MDCRipple(chip);
}


// list，很多样式效果要实例化才会生效，比如点击选中
const lists = document.querySelectorAll('.mdc-deprecated-list');
for (const list of lists) {
    const item = new MDCList(list);
    // 为每个item添加ripple动画
    item.listElements.map((listItemEl) => new MDCRipple(listItemEl));
}

// 数据表
const dataTables = document.querySelectorAll('.mdc-data-table');
for (const dataTableE of dataTables) {
    const item = new MDCDataTable(dataTableE);
}
