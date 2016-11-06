

declare interface TaskInfo {
    Id: number,
    Path: string,
    Icon: string,
    Name: string,
    CpuUsage: number,
    RamUsage: number,
    Threads: number,
    Handles: number,
    IoWriteOperationsPerSec: number,
    IoReadOperationsPerSec: number
}

/*{
    "cpuUsage":[9.481993,6.41368246,6.30547667,0.09315314],
    "totalMemory":17126731776,
    "availableMemory":10091393024,
    "usedMemory":7035338752,
    "runningProceses":147,
    "upTime":294606218,
    "runningAsAdmin":true,
    "drives":[
        {
            "Name":"C:\\",
            "TotalSize":119007080448,
            "FreeSpace":1019727872,
            "IsReady":true,
            "VolumeLabel":"",
            "DriveFormat":"NTFS",
            "DriveType":"Fixed",
            "RootDirectory":"C:\\"
        },
        {
            "Name":"D:\\","TotalSize":1000202039296,
            "FreeSpace":269072261120,
            "IsReady":true,
            "VolumeLabel":"Storage",
            "DriveFormat":"NTFS",
            "DriveType":"Fixed",
            "RootDirectory":"D:\\"
        }
    ]
}
*/
declare interface DriveInfo {
    Name: string,
    TotalSize: number,
    FreeSpace: number,
    IsReady: boolean,
    VolumeLabel: string,
    DriveFormat: string,
    DriveType: string,
    RootDirectory: string,
    Model: string
}

declare interface NetInterfaceInfo {
    Id: string,
    Name: string,
    Description: string,
    NetworkInterfaceType: number,
    OperationalStatus: number,
    Speed: number,
    IsReceiveOnly: boolean,
    SupportsMulticast: boolean
}


declare interface SystemInfo {
    cpuUsage: number[],
    cpuTemps: number[],
    totalMemory: number,
    availableMemory: number,
    usedMemory: number,
    runningProcesses: number,
    upTime: number,
    runningAsAdmin: boolean,
    drives: DriveInfo[],
    motherBoard: string,
    cdRom: string,
    biosInfo: {
        biosManufacturer: string,
        biosSerial: string,
        biosCaption: string
    },
    networkInfo: {
        totalNetworkInterfaces: number,
        networkInterfaces: NetInterfaceInfo[],
        totalBytesReceived: number,
        totalBytesSent: number
    }
}

/*
{
    "cpuName":"Intel® Core™ i5-4690K CPU @ 3.50GHz",
    "id":"BFEBFBFF000306C3",
    "socket":"SOCKET 0",
    "description":"Intel64 Family 6 Model 60 Stepping 3",
    "addressWidth":64,
    "dataWidth":64,
    "speedMhz":3501,
    "busSpeedMhz":100,
    "l2Cache":1048576,
    "l3Cache":6291456,
    "cores":4,
    "threads":4,
    "architecture":"x64"
}
*/
declare interface CpuInfo {
    cpuName: string,
    id: string,
    socket: string,
    description: string,
    addressWidth: number,
    dataWidth: number,
    speedMhz: number,
    busSpeedMhz: number,
    l2Cache: number,
    l3Cache: number,
    cores: number,
    threads: number,
    architecture: string,
    currentClockSpeed: number, //in mhz
    currentVoltage: number
}

/*
{
    "name":"Microsoft Windows 10 Home",
    "version":"10.0.10586",
    "maxProcessCount":4294967295,
    "maxProcessRam":137438953344,
    "architecture":"64-bit",
    "serialNumber":"00326-10000-00000-AA722",
    "build":"10586"
}
*/
declare interface OSInfo {
    name: string,
    version: string,
    maxProcessCount: number,
    maxProcessRam: number,
    architecture: string,
    serialNumber: string,
    build: string
}

/*
{
    "publicIp":"*****",
    "networkDevices":[
        {
            "name":"My-pc",
            "ip":"192.168.1.2",
            "macAddress":"*"
        },
        {"name":"null",
        "ip":"192.168.1.1",
        "macAddress":"*"},
        {"name":"null",
        "ip":"192.168.1.3",
        "macAddress":"*"},
        {"name":"mediapc",
        "ip":"192.168.1.8",
        "macAddress":"*"},
        {"name":"null",
        "ip":"192.168.45.254",
        "macAddress":"*"},
        {"name":"null",
        "ip":"192.168.218.254",
        "macAddress":"*"}
    ],
    "macAddress":"*",
    "internalIp":"192.168.1.2"
}
*/
declare interface NetworkDeviceInfo {
    Name: string,
    Ip: string,
    MacAddress: string
}

declare interface NetworkInfo {
    publicIp: string,
    networkDevices: NetworkDeviceInfo[],
    macAddress: string,
    internalIp: string
}

declare interface GpusInfo {
    gpus: GpuInfo[]
}

declare interface GpuInfo {
    AdapterCompatibility: string,
    AdapterRam: string,
    DriverVersion: string,
    InstalledDisplayDrivers: string[],
    Name: string,
    RefreshRate: number,
    ScreenInfo: string,
    VideoArchitecture: number,
    VideoMemoryType: number,
    Status: string,
    Availability: number,
    Temperature: number
}

declare interface ApiMessage {
    endpoint: string,
    results: any,
    synckey: any
}

declare interface KilledProcessInfo {
    processId: number,
    processKilled: boolean,
    processName: string
}

declare interface StartedProcessInfo {
    path: string,
    processId: string,
    processStarted: boolean
}
/*
{
    "endpoint":"authentication",
    "results": {
        "endpoint":"authentication",
        "authenticated":true,
        "message":"Login was successfull"
    }
}
*/

declare interface AuthInfo {
    authenticated: boolean,
    message: string
}

declare interface UserInfo {
    avatar: string,
    username: string
}


declare interface CameraInfo {
    DevicePath: string,
    DisplayName: string,
    Id: string,
    Name: string
}

declare interface CameraInfos {
    cameraInfo: CameraInfo[]
}


/*
declare interface CameraFrame {
    cameraFrameFailed?: boolean,
    message?: string,
    exceptionMessage?: string,
    cameraId: string,
    cameraFrame: number[]
}
*/
declare interface CameraFrame {
    cameraId: string,
    cameraData: number[]
}

declare interface CameraImage {
    cameraId: string,
    URL: string
}

declare namespace CameraStatus {
    interface Started {
        cameraId: string,
        cameraRunning: boolean,
        cameraStarted: boolean
    }
    interface StreamStarted {
        cameraId: string,
        cameraStreamStarted: boolean
    }
    interface Stopped {
        cameraId: string,
        cameraRunning: boolean,
        cameraStopped: boolean
    }
    interface StreamStopped {
        cameraId: string,
        cameraStreamStopped: boolean
    }
}

declare interface CamerasRefreshed {
    cameraFresh: boolean,
    message: string
}

declare namespace SettingsInfo {

    /*
    { "Debug" : { "TraceDebug" : true },
  "General" : { "ClientIssues" : "https://github.com/Ulterius/client/issues",
      "Github" : "https://github.com/Ulterius",
      "Maintainers" : [ { "Github" : "https://github.com/codeusa",
            "Name" : "Andrew Sampson",
            "Twitter" : "https://twitter.com/Andrewmd5",
            "Website" : "https://andrew.im/"
          },
          { "Github" : "https://github.com/FrobtheBuilder",
            "Name" : "Evan Banyash",
            "Twitter" : "https://twitter.com/frobthebuilder",
            "Website" : "http://banyash.com/"
          }
        ],
      "ServerIssues" : "https://github.com/Ulterius/server/issues",
      "UploadLogs" : false,
      "Version" : { "Build" : 0,
          "Major" : 1,
          "MajorRevision" : 0,
          "Minor" : 0,
          "MinorRevision" : 0,
          "Revision" : 0
        }
    },
  "Network" : { "BindLocal" : false,
      "SkipHostNameResolve" : false
    },
  "Plugins" : { "LoadPlugins" : true },
  "ScreenShare" : { "ScreenSharePass" : "ayy",
      "ScreenSharePort" : 22009
    },
  "TaskServer" : { "Encryption" : true,
      "TaskServerPort" : 22007
    },
  "Terminal" : { "AllowTerminal" : true },
  "WebServer" : { "UseWebServer" : true,
      "WebFilePath" : "C:\\Users\\Frob2\\AppData\\Roaming\\Ulterius\\Ulterius Server\\client\\",
      "WebServerPort" : 22006
    }
    
}
*/

    interface Maintainer {
        Github: string,
        Name: string,
        Twitter: string,
        Website: string
    }

    interface Version {
        Major: number, 
        Minor: number,
        Build: number,
        Revision: number,
        MajorRevision: number,
        MinorRevision: number
    }

    interface Debug { TraceDebug: boolean }

    interface General {
        ClientIssues: string,
        Github: string,
        Maintainers: Maintainer[],
        ServerIssues: string,
        UploadLogs: boolean,
        Version: Version
    }

    interface Network {
        BindLocal: boolean,
        UpnpEnabled: boolean,
        SkipHostNameResolve: boolean
    }

    interface Plugins { LoadPlugins: boolean }

    interface ScreenShare { ScreenSharePort: number }

    interface TaskServer {
        Encryption: boolean,
        TaskServerPort: number
    }

    interface Terminal {
        AllowTerminal: boolean,
        TerminalPort: number
    }

    interface WebServer {
        ToggleWebServer: boolean,
        WebFilePath: string,
        WebServerPort: number
    }

    interface Webcams {
        UseWebcams: boolean,
        WebcamPort: number
    }

    interface Ports {
        webServerPort: number,
        apiPort: number,
        webcamPort: number,
        terminalPort: number,
        screenSharePort: number
    }

    interface Changed {
        changedStatus: boolean
    }

    interface All {
        Debug: Debug,
        General: General,
        Network: Network,
        Plugins: Plugins,
        ScreenShareService: ScreenShare,
        TaskServer: TaskServer,
        Terminal: Terminal,
        WebServer: WebServer,
        Webcams: Webcams
    }
}

declare namespace FileTransfer {
    interface Initial {
        path: string,
        fileValid: boolean,
        fileName: string,
        size: number
    }
    interface Progress {
        path: string,
        downloaded: number,
        total: number
    }
    interface UploadProgress {
        path: string,
        uploaded: number,
        total: number
    }
    interface Complete {
        path: string,
        data: Uint8Array
    }
    interface Approved {
        fileApproved: boolean,
        message: string
    }
}

declare namespace FileSystemInfo {
    interface File {
        FileSize: number,
        Path: string
    }
    interface FileDownload {
        fileBytes: number[],
        fileName: string,
        fileValid: boolean,
        path: string,
        size: number
    }
    interface InitialDownload {
        path: string,
        fileValid: boolean,
        fileName: string,
        size: number
    }
    interface BareProgress {
        path: string,
        downloaded: number,
        total: number
    }
    interface LoadedFile {
        path: string,
        data: number[],
        total: number
    }
    interface Data {
        complete: boolean,
        fileData: number[],
        path: string,
        totalSize: number
    }
    interface FileUpload {
        fileName: string,
        fileUploaded: boolean,
        path: string
    }
    interface Folder {
        ChildFolders: Folder[],
        Name: string
        Files: File[]
    }
    interface Link {
        tempWebPath: string,
        totalSize: number
    }
    interface FileTree {
        DeepWalk: boolean,
        RootFolder: Folder
    }
    namespace Processed {
        interface File {
            FileSize: number,
            Path: string,
            Name: string
        }
        interface Folder {
            ChildFolders: FileSystemInfo.Processed.Folder[],
            Files: FileSystemInfo.Processed.File[],
            Name: string,
            Path: string
        }
        interface FileTree {
            DeepWalk: boolean,
            RootFolder: FileSystemInfo.Processed.Folder
        }
    }
}

declare namespace PluginInfo {
    interface Plugin {
        Name: string,
        Version: number,
        Author: string,
        Website: string,
        Description: string,
        GUID: string,
        Icon: string,
        CanonicalName: string
    }
    interface Plugins {
        [key: string]: Plugin //key is GUID
    }
    interface Started {
        pluginData: {
            [key: string]: any
        },
        pluginStarted: boolean
    }
}

declare interface UpdateInfo {
    update: boolean,
    message: string
}

declare interface DialogContent {
    title: string,
    ///body: string,
    body: __React.Component<any, any> | string
}

declare interface KeyInfo {
    key: string, 
    iv: string
}

declare interface HostInfo {
    host: string, 
    port: string
}

declare interface VncInfo {
    vncStarted: boolean,
    proxyPort: number,
    port: number,
    message: string
}

declare namespace ScriptInfo {
    interface Script {
        Name?: string,
        Type?: string,
        Schedule?: string
    }
    interface Scripts {
        [guid: string]: Script
    }
    interface ProcessedScript extends Script {
        Guid: string,
        Base64ScriptContents: string
    }
    interface FullScript extends Script {
        Guid: string,
        ScriptContents?: string,
        dirty?: boolean
    }
    interface Contents {
        Id: string,
        Base64ScriptContents: string,
        ScriptExist: boolean
    }
    interface Updated {
        AddedOrUpdated: boolean,
        Message: string,
        SavedTo: string
    }
    interface Removed {
        Id: string,
        JobRemoved: boolean,
        JobExisted: boolean
    }
    namespace Daemon {
        interface Started {
            Started: boolean
        }
        interface Stopped {
            ShutDown: boolean
        }
        interface Status {
            Online: boolean
        }
    }
}

declare interface WorkerMessage<T> {
    type: string,
    content: T
}

declare namespace TerminalInfo {
    interface Message {
        correlationId?: number,
        type: string
    }
    interface Terminal {
        terminalType: string,
        id: string,
        currentPath: string
    }
    interface SessionState extends Message {
        userId: string,
        aesShook?: boolean,
        publicKey?: string,
        terminals: Terminal[]
    }
    interface Created extends Message {
        terminalType: string,
        currentPath: string,
        terminalId: string
    }
    interface Closed extends Message {
        terminalId: string
    }
    interface Output {
        output: string,
        endOfCommand?: boolean,
        sensitive?: boolean,
        terminalId: string,
        type?: string,
        correlationId?: number,
        currentPath?: string
    }
    interface Line {
        output: string,
        correlationId: number,
        sensitive: boolean
    }
    interface Input extends Message {
        input: string,
        terminalId: string
    }
}

declare interface ScreenTile {
    x: number,
    y: number,
    top: number,
    bottom: number,
    left: number,
    right: number,
    image: string
}

declare interface FrameData {
    screenBounds: {
        top: number,
        bottom: number,
        left: number,
        right: number,
        x: number,
        y: number,
        height: number,
        isEmpty: boolean,
    },
    frameData: number[]
}

declare interface SearchResult {
    searchGenerationTime: number,
    searchResults: string[],
    success: boolean,
    totalResults: number,
    message?: string
}

declare interface Announcement {
    messageTitle: string,
    messageId: string,
    message: string,
    date: number
}