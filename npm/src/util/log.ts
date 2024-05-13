import { isDebug } from "./tools"

export function consoleDebug(str: string) {
    if (isDebug())
        console.log(str)
}

export function consoleError(str: string) {
    if (isDebug())
        console.error(str)
}
