import { MDCDrawer } from "@material/drawer";
import { MDCList } from '@material/list';
import { MDCRipple } from '@material/ripple';

import { MDCTopAppBar } from '@material/top-app-bar';
// top app bar
const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
// 监听menu按钮点击
topAppBar.listen('MDCTopAppBar:nav', () => {
    console.log("click menu");
    drawer.open = !drawer.open;
});


const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

const listEl = document.querySelector('.mdc-drawer .mdc-list');

document.querySelector('Button').addEventListener('click', () => {
    console.log("click btn");
    drawer.open = !drawer.open;
});

// list，很多样式效果要实例化才会生效，比如点击选中
const lists = document.querySelectorAll('.mdc-deprecated-list');
for (const list of lists) {
    const item = new MDCList(list);
    // 为每个item添加ripple动画
    item.listElements.map((listItemEl) => new MDCRipple(listItemEl));
}