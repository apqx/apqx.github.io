import { isDebug } from "./util/Tools";

export function loadGoogleAnalytics() {
    if (!isDebug()) {
        // Google Analytics需要设置的变量 TODO: 用Typescript实现
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-GDLCDFZXBF');
        // 部署模式下，加载Google Analytics
        var gtagScript = document.createElement('script');
        gtagScript.type = 'text/javascript';
        gtagScript.async = true;
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-GDLCDFZXBF';
        document.head.appendChild(gtagScript);
    }
}