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
    settingsActions,
    dialogActions
} 
from "./action"
import {appStore} from "./store"
import {socket, sendCommandToDefault} from "./socket"
import setIntervals from "./interval"
import {generateHexString} from "./util"
import config from "./config"
import * as _ from "lodash"
declare let JSEncrypt: any
import CryptoJS = require("crypto-js")
let intervals: {[key:string]: number} = {}
export * from "./api"

const resLog = false

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
    if (resLog) console.log("Tasks get")
    taskActions.updateTasks(tasks)
}

export function requestsysteminformation(stats: SystemInfo) {
    if (resLog) console.log("System stats get")
    systemActions.updateStats(stats)
}

export function requestCpuInformation(cpu: CpuInfo) {
    if (resLog) console.log("CPU information get")
    systemActions.updateCPU(cpu)
}

export function requestOSInformation(os: OSInfo) {
    if (resLog) {
        console.log("OS info get")
        console.log(os)
    }
    systemActions.updateOS(os)
}

export function requestNetworkInformation(net: NetworkInfo) {
    if (resLog) console.log("Net information get")
    systemActions.updateNet(net)
}

export function requestGpuInformation(gpus: GpusInfo) {
    if (resLog) console.log("Gpu information get")
    systemActions.updateGpu(gpus)
}

export function killProcess(process: KilledProcessInfo) {
    if (resLog) console.log("Process killed")
    messageActions.processHasBeenKilled(process)
}

export function authenticate(info: AuthInfo) {
    if (info.authenticated) {
        intervals = setIntervals()
        helpers.requestAuxillarySystemInformation()
        //sendCommandToDefault("getEventLogs")
        onAuthenticate()
        
        sendCommandToDefault("getCameras")
        sendCommandToDefault("createFileTree", "C:\\")
        sendCommandToDefault("getCurrentSettings")
        //sendCommandToDefault("getPlugins")
        //sendCommandToDefault("getBadPlugins")
        sendCommandToDefault("checkForUpdate")
        
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
    if (resLog) console.log(cams)
    cameraActions.updateCameras(cams)
}

export function startCamera(status: CameraStatus.Started) {
    if (status.cameraRunning) {
        sendCommandToDefault("startCameraStream", status.cameraId)
    }
}
export function startCameraStream(status: CameraStatus.StreamStarted) {
    if (resLog) console.log(status)
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
    if (resLog) console.log(status)
}

export function getCameraFrame(frame: CameraFrame) {
    cameraActions.updateFrame(frame)
}

export function refreshCameras(status: CamerasRefreshed) {
    if (status.cameraFresh) {
        sendCommandToDefault(getCameras)
    }
    messageActions.message({
        style: status.cameraFresh ? "success" : "danger", 
        text: status.message
    })
}

export function startProcess({path, processStarted}: StartedProcessInfo) {
    if (processStarted) {
        messageActions.message({style: "success", text: `Started process "${path}"`})
    }
    else {
        messageActions.message({style: "danger", text: `Failed to start process "${path}"`})
    }
}

export function aesHandshake(status: {shook: boolean}) {
    if (resLog) console.log(status)
    if (status.shook) {
        appActions.setShake(true)
        appActions.login(false)
        messageActions.message({style: "success", text: "AES handshake complete."})
        sendCommandToDefault("getWindowsData")
        
        if (config.auth.password) {
            sendCommandToDefault("authenticate", config.auth.password)
        }
        if (appStore.getState().auth.password) {
            sendCommandToDefault("authenticate", appStore.getState().auth.password)
        }
    }
}

let key = ""
let iv = ""

export function connectedToUlterius(results: {message: string, publicKey: string}) {
    messageActions.message({style: "success", text: "Connected."})
    appActions.setKey("", "")
    appActions.setShake(false)
    let encrypt = new JSEncrypt()
    encrypt.setPublicKey(atob(results.publicKey))
    key = generateHexString(16)
    iv = generateHexString(16)
    let encKey = encrypt.encrypt(key)
    let encIV = encrypt.encrypt(iv)
    sendCommandToDefault("aesHandshake", [encKey, encIV])
    appActions.setKey(key, iv)
    /*
    setInterval(() => {
        messageActions.message({style: "info", text: "why helo it is I jimbles notronbo"})
        messageActions.message({style: "danger", text: "why helo it is I jimbles notronbo"})
    }, 5000)
    */
    
}

export function checkForUpdate({update, message}: UpdateInfo) {
    if (update) {
        dialogActions.showDialog({title: "Update Available", body: message})
    }
}

export function disconnectedFromUlterius() {
    messageActions.message({style: "danger", text: "Disconnected. Reconnecting in a second..."})
    _.forEach(intervals, (v: number, k) => {
        clearInterval(v)
    })
}

function onAuthenticate() {
    //just a spot to put my calls that I don't do anything with.
    //dialogActions.showDialog({title: "Hi!", body: "How are you doing today?"})
    //sendCommandToDefault("getBadPlugins")
}