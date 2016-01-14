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
        return tasks.filter(task => task.name != "Idle" &&
                                    task.name != "System" &&
                                    task.name != "_Total" )
                    .map(task => {
                        if (task.icon === "null") {
                            task.icon = defaultIcon
                        }
                        return task
                    })
    }
}


export default alt.createActions<Actions>(TaskActions)
