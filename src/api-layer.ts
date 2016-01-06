import taskActions from "./action/task-actions"

export function requestProcessInformation(tasks: TaskInfo[]) {
    console.log("Tasks get")
    taskActions.updateTasks(tasks)
}
