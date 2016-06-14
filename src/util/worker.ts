import * as _ from "lodash"

interface BoundWorkerClass {
    new (): Worker
}

interface WrappedWorker {
    busy: boolean,
    worker: Worker
}

interface WorkerTask {
    type: string,
    content: any
}

export class WorkerPool {
    workers: WrappedWorker[] = []
    taskQueue: WorkerTask[] = []
    constructor(workerClass: BoundWorkerClass, size: number) {
        for (let i = 0; i < size; i++) {
            this.workers.push({
                busy: false,
                worker: new workerClass()
            })
        }
        if (!this.oneWorker()) {
            this.workers.forEach(w => {
                w.worker.addEventListener("message", () => {
                    this.onWorkerMessage(w)
                })
            })
        }
    }
    onWorkerMessage = (worker: WrappedWorker) => {
        worker.busy = false
        if (this.taskQueue.length > 0) {
            let {type, content} = this.taskQueue.shift()
            this.post(type, content)
        }
    }
    poolSize() {
        return this.workers.length
    }
    oneWorker() {
        return this.poolSize() == 1
    }
    post(type: string, content?: any) {
        if (this.oneWorker()) {
            this.workers[0].worker.postMessage({type, content})
            return;
        }
        let freeWorker = _.find(this.workers, w => !w.busy)
        if (freeWorker) {
            freeWorker.worker.postMessage({ type, content })
            freeWorker.busy = true
        }
        else {
            this.taskQueue.push({ type, content })
        }
    }
    listen(callbacks: {[key: string]: Function}) {
        this.workers.forEach(w => {
            w.worker.addEventListener("message", ({data}) => {
                if (!w.busy || this.oneWorker()) {
                    for (let key in callbacks) {
                        if (data.type == key) {
                            callbacks[key](data.content)
                        }
                    }
                }
                /*
                _.forOwn(callbacks, (callback, key) => {
                    if (data.type == key) {
                        callback(data.content)
                    }
                })
                */
            })
        })
    }
    terminate() {
        this.workers.forEach(w => {
            w.worker.terminate()
        })
    }
}