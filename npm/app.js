import { MDCRipple } from '@material/ripple';
import { MDCChipSet } from '@material/chips/chip-set';
import { MDCList } from '@material/list';

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

