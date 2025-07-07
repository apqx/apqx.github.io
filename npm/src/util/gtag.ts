import { isDebug } from "./tools";

// 声明全局类型
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export function loadGoogleAnalytics(): void {
    if (isDebug()) return;
    
    // Google Analytics需要设置的变量
    window.dataLayer = window.dataLayer || [];

    function gtag(...args: any[]): void {
        window.dataLayer.push(args);
    }

    // 将 gtag 函数添加到 window 对象
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', 'G-GDLCDFZXBF');
    
    // 部署模式下，加载Google Analytics
    const gtagScript = document.createElement('script');
    gtagScript.type = 'text/javascript';
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-GDLCDFZXBF';
    document.head.appendChild(gtagScript);
}