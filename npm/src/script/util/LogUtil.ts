import { isDebug } from "./Tools"


export function console_debug(str: string) {
    if (isDebug())
        console.log(str)
}

export function console_error(str: string) {
    if (isDebug())
        console.error(str)
}