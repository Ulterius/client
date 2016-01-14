import taskActions from "./action/task-actions"
import systemActions from "./action/system-actions"
import {messageActions} from "./action/misc-actions"
import {socket} from "./socket"
import setIntervals from "./interval"
import appState from "./app-state"

export function requestProcessInformation(tasks: TaskInfo[]) {
    console.log("Tasks get")
    taskActions.updateTasks(tasks)
}

export function requestSystemInformation(stats: SystemInfo) {
    console.log("System stats get")
    systemActions.updateStats(stats)
}

export function killProcess(process: KilledProcessInfo) {
    console.log("Process killed")
    messageActions.processHasBeenKilled(process)
}

export function authentication(info: AuthInfo) {
    if (info.authenticated) {
        setIntervals(socket)
        appState.authenticated = true
    }
}
