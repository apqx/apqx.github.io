import styles from "../../style/global.module.scss"
import { consoleInfo } from "../../util/log"

export enum Screen {
    Small, Middle, Large
}

export function getScreenType(): Screen {
    consoleInfo(`getScreenType screenMiddleMaxWidth is ${styles.screenMiddleMaxWidth}, screenSmallMaxWidth is ${styles.screenSmallMaxWidth}`)
    const screenWidth = document.body.offsetWidth
    if (screenWidth > parsePx(styles.screenMiddleMaxWidth)) {
        return Screen.Large
    } else if (screenWidth > parsePx(styles.screenSmallMaxWidth)) {
        return Screen.Middle
    } else {
        return Screen.Small
    }
}

/**
 * 将 rem 字符串（或纯数字）转换为对应的 px 数值
 * @param remValue 例如 "4.5rem" 或 4.5
 * @returns 对应的像素数值 (number)
 */
export function remToPx(remValue: string | number): number {
    const numericValue =
        typeof remValue === 'number' ? remValue : parseFloat(remValue.trim())

    if (Number.isNaN(numericValue)) {
        throw new Error(`Invalid rem value: "${remValue}"`)
    }

    // 获取 <html> 元素的实时计算字号（浏览器默认通常为 16px）
    const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    )

    const result = numericValue * (rootFontSize || 16)
    consoleInfo(`remToPx ${remValue} => ${result}`)
    return result
}

export function parsePx(px: string) : number {
    const num = px.replace("px", "")
    if (Number.isNaN(num)) {
        throw new Error(`Invalid rem value: "${num}"`)
    }
    return parseFloat(px)
}