const debugMode = false


export function console_debug(str: string) {
    if (debugMode)
        console.log(str)
}

export function console_error(str: string) {
    if (debugMode)
        console.error(str)
}