import { MDCRipple } from '@material/ripple';
import { MDCChipSet } from '@material/chips/chip-set';
import { MDCList } from '@material/list';
import hljs from 'highlight.js/lib/core';
// import hljs from 'highlight.js';
import 'highlight.js/styles/androidstudio.css';

import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('bash', bash);
import c from 'highlight.js/lib/languages/c';
hljs.registerLanguage('c', c);
import csharp from 'highlight.js/lib/languages/csharp';
hljs.registerLanguage('csharp', csharp);
import cpp from 'highlight.js/lib/languages/cpp';
hljs.registerLanguage('cpp', cpp);
import css from 'highlight.js/lib/languages/css';
hljs.registerLanguage('css', css);
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);
import java from 'highlight.js/lib/languages/java';
hljs.registerLanguage('java', java);
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
import kotlin from 'highlight.js/lib/languages/kotlin';
hljs.registerLanguage('kotlin', kotlin);
import markdown from 'highlight.js/lib/languages/markdown';
hljs.registerLanguage('markdown', markdown);
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('python', python);
import ruby from 'highlight.js/lib/languages/ruby';
hljs.registerLanguage('ruby', ruby);
import rust from 'highlight.js/lib/languages/rust';
hljs.registerLanguage('rust', rust);
import scss from 'highlight.js/lib/languages/scss';
hljs.registerLanguage('scss', scss);
import sql from 'highlight.js/lib/languages/sql';
hljs.registerLanguage('sql', sql);
import shell from 'highlight.js/lib/languages/shell';
hljs.registerLanguage('shell', shell);
import swift from 'highlight.js/lib/languages/swift';
hljs.registerLanguage('swift', swift);
import typescript from 'highlight.js/lib/languages/typescript';
hljs.registerLanguage('typescript', typescript);
import yaml from 'highlight.js/lib/languages/yaml';
hljs.registerLanguage('yaml', yaml);
import groovy from 'highlight.js/lib/languages/groovy';
hljs.registerLanguage('groovy', groovy);
import gradle from 'highlight.js/lib/languages/gradle';
hljs.registerLanguage('gradle', gradle);
import http from 'highlight.js/lib/languages/http';
hljs.registerLanguage('http', http);
import dart from 'highlight.js/lib/languages/dart';
hljs.registerLanguage('dart', dart);

hljs.highlightAll();

// 为所有的button添加ripple动画 TODO：似乎并没有生效，button的点击效果没有出现
for (const btn of document.querySelectorAll('.mdc-button')) {
    btn.addEventListener('click', () => {
        console.log("click btn")
    });
    const btnRipple = new MDCRipple(btn);
}


// 初始化chipSet
try {
    // 部分页面没有chipset，捕捉异常
    const chipset = new MDCChipSet(document.querySelector('.mdc-evolution-chip-set'));
} catch (e) {
    console.log("catch e = " + e.message);
}
// 为chip添加ripple动画
const chips = document.querySelectorAll('.mdc-evolution-chip__action');
for (let chip of chips) {
    new MDCRipple(chip);
}


// list，很多样式效果要实例化才会生效，比如点击选中
const lists = document.querySelectorAll('.mdc-deprecated-list');
for (const list of lists) {
    const item = new MDCList(list);
    // 为每个item添加ripple动画
    item.listElements.map((listItemEl) => new MDCRipple(listItemEl));
}

