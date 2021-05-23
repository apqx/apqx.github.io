$(document).ready(function () {
    // highlight.js
    hljs.highlightAll();
});

console.log("Hello");


// When the user clicks on the button, scroll to the top of the document
const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
    } else {
        // M.toast({html: '🐸'})
    }
};

const copyUrl = () => {
    // 截取、处理当前URL中的中文，encode后复制到剪切板
    // M.toast({html: '🐸'})
};

// 根据屏幕宽度确定大屏、小屏，大屏使用可收缩的top app bar
console.log("screen width: " + $(window).width() );

if($(window).width() >= 880) {
    // document.getElementById("top_app_bar").classList.add("mdc-top-app-bar--short");
}