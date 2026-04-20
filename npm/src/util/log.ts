import { Logger } from "tslog";
import { isDebug } from "./tools"

const log = new Logger(
    {
        // 使用本地时间
        prettyLogTimeZone: "local",
        // 关闭颜色
        stylePrettyLogs: false,
        // 自定义输出模板，确保信息密度
        prettyLogTemplate: "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{mm}}:{{ss}} {{logLevelName}} ",
    }
);

export function consoleInfo(str: string) {
    if (isDebug())
        log.info(str)
}

export function consoleInfoObj(hint: string, obj: any) {
    if (isDebug()) {
        log.info(hint)
        console.log(obj)
    }
}

export function consoleInfoArray(hint: string, obj: Array<any>) {
    if (isDebug()) {
        log.info(hint)
        console.log(obj)
    }
}

export function consoleError(str: string) {
    if (isDebug())
        log.error(str)
}

export function consoleErrorObj(hint: string, obj: any) {
    if (isDebug()) {
        log.error(hint)
        console.error(obj)
    }
}
