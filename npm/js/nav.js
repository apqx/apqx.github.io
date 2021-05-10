// 处理导航相关

import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from "@material/drawer";


// top app bar
const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
// 监听menu按钮点击
topAppBar.listen('MDCTopAppBar:nav', () => {
    console.log("click menu");
    drawer.open = !drawer.open;
});

// 为fab添加ripple动画
const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));
const fabUp = document.getElementById('fabUp');
fabUp.addEventListener('click', () => {
    console.log("click fab");
    // drawer.open = !drawer.open;
});

const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const listEl = document.querySelector('.mdc-drawer .mdc-evolution-list');
const mainContentEl = document.querySelector('.main-content');

// listEl.addEventListener('click', (event) => {
//   drawer.open = false;
// });

// document.body.addEventListener('MDCDrawer:closed', () => {
//   mainContentEl.querySelector('input, button').focus();
// });

// document.body.addEventListener('MDCDrawer:open', () => {
//     mainContentEl.querySelector('input, button').focus();
//   });

// 关于我dialog
const aboutMeDialog = new MDCDialog(document.getElementById('about_me_dialog'));
document.getElementById('btn_about_me').addEventListener('click', () => {
    console.log("click about me");
    aboutMeDialog.open();
});
// 侧边导航的关于我
document.getElementById('drawer-a-about-me').addEventListener('click', () => {
    console.log("click nav about me");
    aboutMeDialog.open();
});