const debugMode = true


export function console_debug(str) {
    if (debugMode)
        console.log(str)
}

export function console_error(str) {
    if (debugMode)
        console.error(str)
}