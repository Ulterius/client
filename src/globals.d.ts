

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

declare interface ApiMessage {
    endpoint: string,
    results: any
}
