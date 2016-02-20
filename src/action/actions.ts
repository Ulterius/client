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
    setPassword(password: string): string
}

class AppActions extends AbstractActions implements AppActionFunctions{
    login(loggedIn: boolean) {
        return loggedIn
    }
    setPassword(password: string) {
        return password
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

class SystemActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "updateStats",
            "updateNet",
            "updateCPU",
            "updateOS",
            "updateGpu",
            "updateUser"
        )
    }
}

export let systemActions = alt.createActions<SystemActionFunctions>(SystemActions)



import {frameBufferToImageURL} from "../util"

interface CameraActionFunctions {
    updateCameras(cams: CameraInfos): CameraInfo[]
    updateFrame(frame: CameraFrame): CameraImage,
    startCameraStream(Id: string): string
    stopCameraStream(Id: string): string
}

class CameraActions extends AbstractActions implements CameraActionFunctions {
    
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

export let cameraActions = alt.createActions<CameraActionFunctions>(CameraActions)

interface SettingsActionFunctions {
    //sometimes great type safety requires great sacrifice
    //such as all ten (10) of your fingers
    updateWebServer(info: SettingsInfo.WebServer): SettingsInfo.WebServer
    updateWebServerPort(info: SettingsInfo.WebServerPort): SettingsInfo.WebServerPort
    updateWebFilePath(info: SettingsInfo.WebFilePath): SettingsInfo.WebFilePath
    updateVncPass(info: SettingsInfo.VncPass): SettingsInfo.VncPass
    updateVncPort(info: SettingsInfo.VncPort): SettingsInfo.VncPort
    updateVncProxyPort(info: SettingsInfo.VncProxyPort): SettingsInfo.VncProxyPort
    updateTaskServerPort(info: SettingsInfo.TaskServerPort): SettingsInfo.TaskServerPort
    updateNetworkResolve(info: SettingsInfo.NetworkResolve): SettingsInfo.NetworkResolve
    getAllSettings(info: SettingsInfo.Settings): SettingsInfo.Settings
}

class SettingsActions extends AbstractActions  {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "updateWebServer",
            "updateWebServerPort",
            "updateWebFilePath",
            "updateVncPass",
            "updateVncPort",
            "updateVncProxyPort",
            "updateTaskServerPort",
            "updateNetworkResolve",
            "getAllSettings"
        )
    }
}

export let settingsActions = alt.createActions<SettingsActionFunctions>(SettingsActions)


interface FileSystemActionFunctions {
    updateFileTree(tree: FileSystemInfo.FileTree): FileSystemInfo.FileTree
    goBack(): boolean
}

class FileSystemActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
    }
    updateFileTree(tree: FileSystemInfo.FileTree) {
        /*
        let newTree: FileSystemInfo.Processed.FileTree
        newTree.DeepWalk = tree.DeepWalk
        newTree.RootFolder = {
            Name: tree.RootFolder.Name.substr(tree.RootFolder.Name.lastIndexOf("\\")),
            Path: tree.RootFolder.Name,
            ChildFolders: tree.RootFolder.ChildFolders.map(folder => {
                return {
                    Name: folder.Name.substr(folder.Name.lastIndexOf("\\")),
                    Path: folder.Name,
                    
                }
            })
        }
        */
        return tree
    }
    goBack() {
        return true
    }
}

export let fileSystemActions = alt.createActions<FileSystemActionFunctions>(FileSystemActions)