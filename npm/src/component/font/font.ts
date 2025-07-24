import { getLocalRepository } from "../../repository/LocalRepository"
import { toggleClassWithEnable } from "../../util/tools"
import { consoleError } from "../../util/log"

/**
 * 初始化主字体
 */
export function initFont() {
    // 废弃handwritten设置，TODO: 注意旧版本可能启用了这个设置项
    // const localHandWritingFontOn = localRepository.getHandWritingFontOn()
    // setHandwrittenFont(localHandWritingFontOn)
    const localNotoSerifSCFontOn = getLocalRepository().getNotoSerifSCFontOn()
    setNotoSerifSCFont(localNotoSerifSCFontOn)
}

export function setHandwrittenFont(on: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, "font-handwritten", on)
    checkFont()
}

export function setNotoSerifSCFont(on: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, "font-noto-serif-sc", on)
    checkFont()
}

export function setNotoSansSCFont(on: boolean) {
    const bodyE = document.body
    toggleClassWithEnable(bodyE, "font-noto-sans-sc", on)
    checkFont()
}

export function checkFont() {
    // 默认加载：霞鹜文楷，思源宋体，避免切换字体时动态加载的延迟

    // 按需加载

    // 手写字体，汉仪许静行楷
    const handwrittenIndexElements = document.querySelectorAll(".font-handwritten")
    if (handwrittenIndexElements.length > 0)
        import("./fontHandwritten").then().catch((e) => {
            consoleError("Load handwritten font error: " + e)
        })
}

// 动态加载云端字体
export function loadCloudFont(url: string, fontName: string): Promise<void> {
    // 检查是否已经加载过该字体
    if (document.querySelector(`link[href="${url}"]`)) {
        console.log(`Cloud font ${fontName} already loaded`);
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.onload = () => {
            console.log(`Cloud font ${fontName} loaded successfully`);
            resolve();
        };
        link.onerror = () => {
            console.error(`Failed to load cloud font ${fontName}`);
            reject(new Error(`Failed to load cloud font: ${fontName}`));
        };
        document.head.appendChild(link);
    });
}