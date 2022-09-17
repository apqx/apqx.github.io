/**
 * 当HTML元素加载完成后执行指定的任务
 * @param task
 */
export function runOnHtmlDone(task) {
    // 监听HTML元素加载完成的DOMContentLoaded事件，但是有时候该事件会在设置监听器之前完成，所以这里检查一下是否已经完成了
    if (document.readyState !== "loading") {
        task()
    } else {
        // HTML元素加载完成，但是CSS等资源还未加载
        document.addEventListener("DOMContentLoaded", () => {
            task()
        })
    }
}