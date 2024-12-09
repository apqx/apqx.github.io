export function getPostDate(url: string): string {
    const regExp = new RegExp("(\\d{4})/(\\d{2})/(\\d{2})")
    const matches = url.match(regExp)
    if (matches != null) {
        return matches[1] + "年" + matches[2] + "月" + matches[3] + "日"
    }
    return ""
}