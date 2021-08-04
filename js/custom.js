/**
 * 回到顶部
 */
function scrollToTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
    } 
};

// 根据屏幕宽度确定大屏、小屏，大屏使用可收缩的top app bar
console.log("screen width: " + $(window).width() );

if($(window).width() >= 880) {
    // document.getElementById("top_app_bar").classList.add("mdc-top-app-bar--short");
}