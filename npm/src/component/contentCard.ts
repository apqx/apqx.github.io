// import "./contentCard.scss"

/**
 * 卡片默认是偏移和透明的，初始化卡片使其恢复到原位置和不透明
 * @param withAnimation 是否使用动画
 */
export function initContentCard(withAnimation: boolean) {
    const cardE = document.querySelector(".content-card.fade-in-animation")
    if (withAnimation) {
        // 启动动画，卡片恢复到原位置和不透明度
        cardE?.classList.add("fade-in-animation--start")
    } else {
        // 不启动动画，删除使卡片偏移、透明的动画class
        cardE?.classList.remove("fade-in-animation")
    }
}
