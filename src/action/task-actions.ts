import AbstractActions from "./abstract-actions"
import alt from "../alt"

interface Actions {
    updateTasks(tasks: TaskInfo[]): TaskInfo[]
}

class TaskActions extends AbstractActions implements Actions {

    updateTasks(tasks: TaskInfo[]) {
        console.log("Executing action: Update tasks")

        //these "processes" have no icon and are generally not meaningful in any way.
        return tasks.filter(task => task.name != "Idle" &&
                                    task.name != "System" &&
                                    task.name != "_Total" )
    }
}


export default alt.createActions<Actions>(TaskActions)
