import taskActions from "./action/task-actions"
import systemActions from "./action/system-actions"

export function requestProcessInformation(tasks: TaskInfo[]) {
    console.log("Tasks get")
    taskActions.updateTasks(tasks)
}

export function requestSystemInformation(stats: SystemInfo) {
    console.log("System stats get")
    systemActions.updateStats(stats)
}
