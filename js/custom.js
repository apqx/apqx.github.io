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

/**
 * 点击图片，跳转到原图
 */
 function clickShowOriginalImg(event) {
    var url = event.target.src;
    // 所有的图片，缩略图都加了_thumb后缀，删除后即为原图
    url = url.replace("_thumb", "")
    console.log("click show original img => " + url);
    window.open(url, "_blank");
};

// 根据屏幕宽度确定大屏、小屏，大屏使用可收缩的top app bar
console.log("screen width: " + $(window).width() );

if($(window).width() >= 880) {
    // document.getElementById("top_app_bar").classList.add("mdc-top-app-bar--short");
}