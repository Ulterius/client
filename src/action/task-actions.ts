import AbstractActions from "./abstract-actions"
import alt from "../alt"
import {defaultIcon} from "../util"

interface Actions {
    updateTasks(tasks: TaskInfo[]): TaskInfo[]
}

class TaskActions extends AbstractActions implements Actions {

    updateTasks(tasks: TaskInfo[]) {
        //discard processes that are not meaningful
        //and give a default icon to any process missing one.
        return tasks.filter(task => task.Name != "Idle" &&
                                    task.Name != "System" &&
                                    task.Name != "_Total" )
                    .map(task => {
                        if (task.Icon === "null") {
                            task.Icon = defaultIcon
                        }
                        return task
                    })
    }
}

export let taskActions = alt.createActions<Actions>(TaskActions)
export default taskActions
