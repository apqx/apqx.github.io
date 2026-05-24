export async function showInfoDialogAsync(loadedCallback?: () => void) {
    import("./InfoDialog").then((component) => {
        component.showInfoDialog()
        loadedCallback?.()
    })
}

export async function showShareDialogAsync(loadedCallback?: () => void) {
    import("./ShareDialog").then((component) => {
        component.showShareDialog()
        loadedCallback?.()
    })
}