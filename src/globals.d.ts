

declare interface TaskInfo {
    id: number,
    path: string,
    icon: string,
    name: string,
    cpuUsage: number,
    ramUsage: number,
    threads: number,
    handles: number,
    ioWriteOperationsPerSec: number,
    ioReadOperationsPerSec: number
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
    runningProceses: number,
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
        {"name":"null","ip":"192.168.1.1","macAddress":"*"},
        {"name":"null","ip":"192.168.1.3","macAddress":"*"},
        {"name":"mediapc","ip":"192.168.1.8","macAddress":"*"},
        {"name":"null","ip":"192.168.45.254","macAddress":"*"},
        {"name":"null","ip":"192.168.218.254","macAddress":"*"}
    ],
    "macAddress":"*",
    "internalIp":"192.168.1.2"
}
*/
declare interface NetworkDeviceInfo {
    name: string,
    ip: string,
    macAddress: string
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
    results: any
}

declare interface KilledProcessInfo {
    processId: number,
    processKilled: boolean,
    processName: string
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

declare interface CameraFrame {
    cameraFrameFailed?: boolean,
    message?: string,
    exceptionMessage?: string,
    cameraId: string,
    cameraFrame: number[]
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

/*
declare interface CameraStatus {
    
    cameraStatus: boolean,
    cameraStopped: boolean
}
*/