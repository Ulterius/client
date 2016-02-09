import alt from "../alt"
import AbstractActions from "./abstract-actions"
import {Message} from "../store"

interface MessageActionFunctions {
    plainMessage(message: string): Message
    processHasBeenKilled(process: KilledProcessInfo): Message
    message(message: Message): Message
}

class MessageActions extends AbstractActions implements MessageActionFunctions {
    processHasBeenKilled(process: KilledProcessInfo) {
        return {
            style: "success",
            text: "Process killed: " + process.processName + ", ID: " + process.processName
        }
    }
    plainMessage(message: string) {
        return {
            style: "info",
            text: message
        }
    }
    message(message: Message) {
        return message
    }
}

export let messageActions = alt.createActions<MessageActionFunctions>(MessageActions)



interface AppActionFunctions {
    login(loggedIn: boolean): boolean
}

class AppActions extends AbstractActions implements AppActionFunctions{
    login(loggedIn: boolean) {
        return loggedIn
    }
}

export let appActions = alt.createActions<AppActionFunctions>(AppActions)



interface SystemActionFunctions {
    updateStats(stats: SystemInfo): SystemInfo
    updateNet(net: NetworkInfo): NetworkInfo
    updateCPU(cpu: CpuInfo): CpuInfo
    updateOS(os: OSInfo): OSInfo
    updateGpu(gpus: GpusInfo): GpusInfo
    updateUser(user: UserInfo): UserInfo
}

class SystemActions extends AbstractActions implements SystemActionFunctions {

    updateStats(stats: SystemInfo) {
        return stats
    }
    updateNet(net: NetworkInfo) {
        return net
    }
    updateCPU(cpu: CpuInfo) {
        return cpu
    }
    updateOS(os: OSInfo) {
        return os
    }
    updateGpu(gpus: GpusInfo) {
        return gpus
    }
    updateUser(user: UserInfo) {
        return user
    }
}

export let systemActions = alt.createActions<SystemActionFunctions>(SystemActions)


import {frameBufferToImageURL} from "../util"

interface Actions {
    updateCameras(cams: CameraInfos): CameraInfo[]
    updateFrame(frame: CameraFrame): CameraImage,
    startCameraStream(Id: string): string
    stopCameraStream(Id: string): string
}

class CameraActions extends AbstractActions implements Actions {
    
    updateCameras(cams: CameraInfos) {
        return cams.cameraInfo
    }
    
    updateFrame(frame: CameraFrame) {
        return {
            cameraId: frame.cameraId,
            URL: frameBufferToImageURL(frame.cameraFrame)
        }
    }
    startCameraStream(Id: string) {
        return Id
    }
    stopCameraStream(Id: string) {
        return Id
    }
    
}

export let cameraActions = alt.createActions<Actions>(CameraActions)


