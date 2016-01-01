import AbstractActions from "./abstract-actions"
import {Task} from "../store/task-store"
import alt from "../alt"

interface Actions {
    updateTasks(tasks: Task[]): Task[]
}

class TaskActions extends AbstractActions implements Actions {

    updateTasks(tasks: Task[]) {
        return tasks
    }

}

export default alt.createActions<Actions>(TaskActions)
