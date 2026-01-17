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
    if (window.document.getElementById('google-analytics')) return;

    // Google Analytics 需要设置的变量
    window.dataLayer = window.dataLayer || [];

    // 将 gtag 函数添加到 window 对象
    window.gtag = function (...args: any[]): void {
        window.dataLayer.push(arguments);
    }

    window.gtag('js', new Date());
    window.gtag('config', 'G-GDLCDFZXBF');

    // 部署模式下，加载 Google Analytics
    const gtagScript = document.createElement('script');
    gtagScript.type = 'text/javascript';
    gtagScript.id = 'google-analytics';
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-GDLCDFZXBF';
    document.head.appendChild(gtagScript);
}