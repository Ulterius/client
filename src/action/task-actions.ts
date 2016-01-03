import AbstractActions from "./abstract-actions"
import alt from "../alt"

interface Actions {
    updateTasks(tasks: TaskInfo[]): TaskInfo[]
}

class TaskActions extends AbstractActions implements Actions {

    updateTasks(tasks: TaskInfo[]) {
        console.log("Executing action: Update tasks")
        return tasks
    }
}


export default alt.createActions<Actions>(TaskActions)
