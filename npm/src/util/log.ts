import { isDebug } from "./tools"

export function consoleDebug(str: string) {
    if (isDebug())
        console.log(str)
}

export function consoleObjDebug(hint: string, obj: any) {
    if (isDebug()) {
        console.log(hint)
        console.log(obj)
    }
}

export function consoleArrayDebug(hint: string, obj: Array<any>) {
    if (isDebug()) {
        console.log(hint)
        console.log(obj)
    }
}

export function consoleError(str: string) {
    if (isDebug())
        console.error(str)
}
