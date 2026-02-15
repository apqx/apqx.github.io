export class BaseExternalStore {
    private observers = new Set<() => void>()

    // 订阅状态变化，返回解除订阅的函数
    // 注意这里的 subscribe 是一个函数
    subscribe = (observer: () => void) => {
        this.observers.add(observer)
        return () => this.unsubscribe(observer)
    }

    unsubscribe(observer: () => void) {
        this.observers.delete(observer)
    }

    emitChange() {
        this.observers.forEach(observer => observer())
    }
}