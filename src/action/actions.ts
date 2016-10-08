import alt from "../alt"
import AbstractActions from "./abstract-actions"
import {Message} from "../store"

interface MessageActionFunctions {
    plainMessage(message: string): Message
    processHasBeenKilled(process: KilledProcessInfo): Message
    message(message: Message): Message
    msg(style: string, text: string): Message
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
    msg(style: string, text: string) {
        return {style, text}
    }
}

export let messageActions = alt.createActions<MessageActionFunctions>(MessageActions)



interface DialogActionFunctions {
    showDialog(dialog: DialogContent): DialogContent
    closeFirstDialog(): boolean
}

class DialogActions extends AbstractActions {
    showDialog(dialog: DialogContent) {
        return dialog
    }
    closeFirstDialog() {
        return true
    }
}

export let dialogActions = alt.createActions<DialogActionFunctions>(DialogActions)



interface AppActionFunctions {
    login(loggedIn: boolean): boolean
    setPassword(password: string): string
    setKey(key: string, iv: string): KeyInfo
    setShake(shook: boolean): boolean
    setHost(host: HostInfo): HostInfo
    setDebugMenu(enabled: boolean): boolean
}

class AppActions extends AbstractActions implements AppActionFunctions{
    login(loggedIn: boolean) {
        return loggedIn
    }
    setPassword(password: string) {
        return password
    }
    setKey(key: string, iv: string) {
        return {key, iv}
    }
    setShake(shook: boolean) {
        return shook
    }
    setHost(host: HostInfo) {
        return host
    }
    setDebugMenu(enabled: boolean) {
        return enabled
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
    updateFrame(frame: CameraImage): CameraImage,
    startCameraStream(Id: string): string
    stopCameraStream(Id: string): string
}

class CameraActions extends AbstractActions {
    
    updateCameras(cams: CameraInfos) {
        return cams.cameraInfo
    }
    updateFrame(frame: CameraImage) {
        return frame
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
    /*
    updateWebServer(info: SettingsInfo.WebServer): SettingsInfo.WebServer
    updateWebServerPort(info: SettingsInfo.WebServerPort): SettingsInfo.WebServerPort
    updateWebFilePath(info: SettingsInfo.WebFilePath): SettingsInfo.WebFilePath
    updateVncPass(info: SettingsInfo.VncPass): SettingsInfo.VncPass
    updateVncPort(info: SettingsInfo.VncPort): SettingsInfo.VncPort
    updateVncProxyPort(info: SettingsInfo.VncProxyPort): SettingsInfo.VncProxyPort
    updateTaskServerPort(info: SettingsInfo.TaskServerPort): SettingsInfo.TaskServerPort
    updateNetworkResolve(info: SettingsInfo.NetworkResolve): SettingsInfo.NetworkResolve
    getAllSettings(info: SettingsInfo.Settings): SettingsInfo.Settings
    */
    updateSetting(setting: any): any
    updateAllSettings(allSettings: SettingsInfo.All): SettingsInfo.All
}

class SettingsActions extends AbstractActions  {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "updateSetting",
            "updateAllSettings"
        )
    }
}

export let settingsActions = alt.createActions<SettingsActionFunctions>(SettingsActions)


interface FileSystemActionFunctions {
    updateFileTree(tree: FileSystemInfo.FileTree): FileSystemInfo.FileTree
    createRoot(drives: DriveInfo[]): DriveInfo[]
    goBack(): boolean
    goForward(): boolean
    reloadFileTree(tree: FileSystemInfo.FileTree): FileSystemInfo.FileTree
    addDownload(file: FileTransfer.Initial): FileTransfer.Initial
    downloadProgress(data: FileTransfer.Progress): FileTransfer.Progress
    uploadProgress(file: FileTransfer.UploadProgress): FileTransfer.UploadProgress
    downloadComplete(data: FileTransfer.Complete): FileTransfer.Complete
    removeDownload(path: string): string
    search(result: SearchResult): SearchResult
    clearSearch(): void
}

class FileSystemActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "removeDownload",
            "updateFileTree",
            "addDownload",
            "downloadProgress",
            "downloadComplete",
            "reloadFileTree",
            "uploadProgress",
            "search",
            "clearSearch",
            "createRoot"
        )
    }
    goBack() {
        return true
    }
    goForward() {
        return true
    }
}

export let fileSystemActions = alt.createActions<FileSystemActionFunctions>(FileSystemActions)

interface PluginActionFunctions {
    updatePlugins(plugins: PluginInfo.Plugins): PluginInfo.Plugins
    startPlugin(plugin: PluginInfo.Started): PluginInfo.Started
}

class PluginActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "updatePlugins",
            "startPlugin"
        )
    }
}

export let pluginActions = alt.createActions<PluginActionFunctions>(PluginActions)


interface TerminalActionFunctions {
    addTerminal(descriptor: TerminalInfo.Terminal): TerminalInfo.Terminal
    removeTerminal(id: string): string
    output(content: TerminalInfo.Output): TerminalInfo.Output
    addLine(line: string): string
    expectTerminal(): void
}

class TerminalActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "addTerminal",
            "removeTerminal",
            "output",
            "addLine",
            "expectTerminal"
        )
    }
}

export let terminalActions = alt.createActions<TerminalActionFunctions>(TerminalActions)


interface ScriptActionFunctions {
    getAllJobs(jobs: ScriptInfo.Scripts): ScriptInfo.Scripts
    mergeFromServer(newScript: ScriptInfo.FullScript): ScriptInfo.FullScript
    mergeLocally(script: ScriptInfo.FullScript): ScriptInfo.FullScript
    getDaemonStatus(running: boolean): boolean
    setActive(activeScript: string): string
    remove(guid: string): string
}

class ScriptActions extends AbstractActions {
    constructor(alt: AltJS.Alt) {
        super(alt)
        this.generateActions(
            "getAllJobs",
            "mergeFromServer",
            "mergeLocally",
            "getDaemonStatus",
            "setActive",
            "remove"
        )
    }
}

export let scriptActions = alt.createActions<ScriptActionFunctions>(ScriptActions)