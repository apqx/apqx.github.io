// 处理导航相关

import { MDCDialog } from '@material/dialog';
import { MDCTopAppBar } from '@material/top-app-bar';
import { MDCRipple } from '@material/ripple';
import { MDCDrawer } from "@material/drawer";
import { MDCList } from '@material/list';


// top app bar
const topAppBar = new MDCTopAppBar(document.querySelector('.mdc-top-app-bar'));
// 监听menu按钮点击
topAppBar.listen('MDCTopAppBar:nav', () => {
    console.log("click nav menu");
    drawer.open = !drawer.open;
});

// 为fab添加ripple动画
try {
    const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));
} catch (e) {
    console.log("catch e = " + e.message);
}

const fabUp = document.getElementById('fabUp');
fabUp.addEventListener('click', () => {
    console.log("click fab");
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
    if(event.detail.index > 1) {
        // 点击了除 随笔 转载 之外的item，禁止选中，还原到原来的选中状态
        drawerList.selectedIndex = originalSelectedItem
    }
});

// 关于我dialog
const aboutMeDialog = new MDCDialog(document.getElementById('about_me_dialog'));
aboutMeDialog.listen('MDCDialog:opened', () => {
    // Dialog弹出时应该让Button获取焦点，避免chip出现选中阴影
    // 但是Button获取焦点后颜色会变化，所以立即取消焦点
    document.getElementById('btn_about_me_close').focus();
    document.getElementById('btn_about_me_close').blur();
});

document.getElementById('btn_about_me').addEventListener('click', () => {
    console.log("click about me");
    aboutMeDialog.open();
    // TODO: 在这里切换黑白主题
    // document.body.classList.toggle('dark');
});

// 生成二维码

// 侧边导航的关于我
document.getElementById('drawer-a-about-me').addEventListener('click', () => {
    console.log("click nav about me");
    aboutMeDialog.open();
});