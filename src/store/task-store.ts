import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import taskActions from "../action/task-actions"

//{"id":0,"path":"null","icon":"null","name":"_Total","cpuUsage":100,"ramUsage":3877462016,"threads":2428,"handles":91196,"ioWriteOperationsPerSec":191,"ioReadOperationsPerSec":5731}

interface State {
    tasks: TaskInfo[]
}

class TaskStore extends AbstractStoreModel<State> {

    tasks: TaskInfo[]

    constructor() {
        this.bindListeners({
            handleUpdateTasks: taskActions.updateTasks
        })
        super()
    }

    handleUpdateTasks(tasks: TaskInfo[]) {
        this.tasks = tasks
        console.log("TaskStore is updating tasks.")
    }
}

export default alt.createStore<State>(TaskStore, "TaskStore")
