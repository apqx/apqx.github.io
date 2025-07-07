export class DialogStateObservable {
    private _observers: DialogStateObserver[];

    constructor() {
        this._observers = [];
    }

    addObserver(observer: DialogStateObserver) {
        this._observers.push(observer);
    }

    removeObserver(observer: DialogStateObserver) {
        const index = this._observers.indexOf(observer);
        if (index > -1) {
            this._observers.splice(index, 1);
        }
    }

    notify(dialogState : DialogState) {
        this._observers.forEach(observer => observer.update(dialogState));
    }
}

export class DialogStateObserver {

    update(dialogState: DialogState) {
        console.log(`Dialog state updated: ${dialogState}`);
    }
}

export enum DialogState {
    OPENED = "OPENED",
    CLOSED = "CLOSED",
    LOAD_MORE = "LOAD_MORE"
} 