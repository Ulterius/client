import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import TaskActions from "../action/task-actions"

//{"id":0,"path":"null","icon":"null","name":"_Total","cpuUsage":100,"ramUsage":3877462016,"threads":2428,"handles":91196,"ioWriteOperationsPerSec":191,"ioReadOperationsPerSec":5731}
export interface Task {
    id: number,
    path: string,
    icon: string,
    name: string,
    cpuUsage: number,
    ramUsage: number,
    threads: number,
    handles: number,
    ioWriteOperationsPerSec: number,
    ioReadOperationsPerSec: number
}

interface State {
    tasks: Task[]
}

class TaskStore extends AbstractStoreModel<State> {

    tasks: Task[]

    constructor() {
        super()
        this.bindListeners({
            handleUpdateTasks: TaskActions.updateTasks
        })
    }

    handleUpdateTasks(tasks: Task[]) {
        this.tasks = tasks
        console.log(tasks)
    }
}

export default alt.createStore<State>(TaskStore)
