var debugMode:boolean = undefined

function checkInit() {
    if(debugMode != undefined) return
    // 读取head里的debug标志
    const debugStr: string = document.querySelector("meta[name=debug]").getAttribute("content")
    debugMode = JSON.parse(debugStr)
}

export function console_debug(str: string) {
    checkInit()
    if (debugMode)
        console.log(str)
}

export function console_error(str: string) {
    checkInit()
    if (debugMode)
        console.error(str)
}