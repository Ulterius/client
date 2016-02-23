//import taskActions from "./action/task-actions"
//import systemActions from "./action/system-actions"
//import {messageActions} from "./action/misc-actions"
//import {cameraActions} from "./action/camera-actions"
import {
    taskActions, 
    systemActions, 
    messageActions, 
    cameraActions,
    appActions,
    settingsActions
} 
from "./action"
import {appStore} from "./store"
import {socket, sendCommandToDefault} from "./socket"
import setIntervals from "./interval"
import config from "./config"
import * as _ from "lodash"

let intervals: {[key:string]: number} = {}

export * from "./api"



export let helpers = {
    requestAuxillarySystemInformation: function() {
        sendCommandToDefault("requestCpuInformation")
        sendCommandToDefault("requestNetworkInformation")
        sendCommandToDefault("requestOSInformation")
        sendCommandToDefault("requestgpuinformation")
    },
    startCamera: function(id: string) {
        sendCommandToDefault("startCamera", id)
    },
    stopCamera: function(id: string) {
        sendCommandToDefault("stopCameraStream", id)
    }
}

export function requestProcessInformation(tasks: TaskInfo[]) {
    console.log("Tasks get")
    taskActions.updateTasks(tasks)
}

export function requestsysteminformation(stats: SystemInfo) {
    console.log("System stats get")
    systemActions.updateStats(stats)
}

export function requestCpuInformation(cpu: CpuInfo) {
    console.log("CPU information get")
    systemActions.updateCPU(cpu)
}

export function requestOSInformation(os: OSInfo) {
    console.log("OS info get")
    systemActions.updateOS(os)
}

export function requestNetworkInformation(net: NetworkInfo) {
    console.log("Net information get")
    systemActions.updateNet(net)
}

export function requestGpuInformation(gpus: GpusInfo) {
    console.log("Gpu information get")
    systemActions.updateGpu(gpus)
}

export function killProcess(process: KilledProcessInfo) {
    console.log("Process killed")
    messageActions.processHasBeenKilled(process)
}

export function authentication(info: AuthInfo) {
    if (info.authenticated) {
        //intervals = setIntervals()
        helpers.requestAuxillarySystemInformation()
        //sendCommandToDefault("getEventLogs")
        sendCommandToDefault("getCameras")
        sendCommandToDefault("createFileTree", "C:\\")
        sendCommandToDefault("getCurrentSettings")        
        appActions.login(true)
    }
    else {
        appActions.login(false)
        appActions.setPassword("") //because it's obviously invalid
    }
}

export function getWindowsData(data: UserInfo) {
    systemActions.updateUser(data)
}

export function getEventLogs(logs: any) {
    console.log(logs)
}

export function getCameras(cams: CameraInfos) {
    console.log(cams)
    cameraActions.updateCameras(cams)
}

export function startCamera(status: CameraStatus.Started) {
    if (status.cameraRunning) {
        sendCommandToDefault("startCameraStream", status.cameraId)
    }
}
export function startCameraStream(status: CameraStatus.StreamStarted) {
    console.log(status)
    if (status.cameraStreamStarted) {
        cameraActions.startCameraStream(status.cameraId)
    }
}

export function stopCameraStream(status: CameraStatus.StreamStopped) {
    if (status.cameraStreamStopped) {
        cameraActions.stopCameraStream(status.cameraId)
        sendCommandToDefault("stopCamera", status.cameraId)
    }
}

export function stopCamera(status: CameraStatus.Stopped) {
    console.log(status)
}

export function getCameraFrame(frame: CameraFrame) {
    cameraActions.updateFrame(frame)
}

export function startProcess(status: StartedProcessInfo) {
    if (status.processStarted) {
        messageActions.message({style: "success", text: `Started process "${status.path}"`})
    }
    else {
        messageActions.message({style: "danger", text: `Failed to start process "${status.path}"`})
    }
}



export function connectedToUlterius(results: {authRequired: boolean, message: string}) {
    sendCommandToDefault("getWindowsData")
    messageActions.message({style: "success", text: "Connected."})
    if (results.authRequired) {
        appActions.login(false)
        if (config.auth.password) {
            sendCommandToDefault("authenticate", config.auth.password)
        }
        if (appStore.getState().auth.password) {
            sendCommandToDefault("authenticate", appStore.getState().auth.password)
        }
    }
    /*
    setInterval(() => {
        messageActions.message({style: "info", text: "why helo it is I jimbles notronbo"})
        messageActions.message({style: "danger", text: "why helo it is I jimbles notronbo"})
    }, 5000)
    */
    
}

export function disconnectedFromUlterius() {
    messageActions.message({style: "danger", text: "Disconnected. Reconnecting in a second..."})
    _.forEach(intervals, (v: number, k) => {
        clearInterval(v)
    })
}