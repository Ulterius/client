import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import systemActions from "../action/system-actions"

interface SystemState {
    stats: SystemInfo
}

//system information that's hot, needs regular updating
class SystemStore extends AbstractStoreModel<SystemState> {

    stats: SystemInfo

    constructor() {
        this.bindListeners({
            handleUpdateStats: systemActions.updateStats
        })
        super()
    }

    handleUpdateStats(stats: SystemInfo) {
        this.stats = stats
    }
}

interface AuxState {
    cpu: CpuInfo,
    network: NetworkInfo,
    os: OSInfo,
    gpu: GpusInfo
}

//system information that shouldn't need to be updated that often
class AuxillarySystemStore extends AbstractStoreModel<AuxState> {
    cpu: CpuInfo
    network: NetworkInfo
    os: OSInfo
    gpu: GpusInfo

    constructor() {
        this.bindListeners({
            handleUpdateCpu: systemActions.updateCPU,
            handleUpdateNet: systemActions.updateNet,
            handleUpdateOS: systemActions.updateOS,
            handleUpdateGpu: systemActions.updateGpu
        })
        super()
    }

    handleUpdateCpu(info: CpuInfo) {
        this.cpu = info
    }

    handleUpdateNet(info: NetworkInfo) {
        this.network = info
    }

    handleUpdateOS(info: OSInfo) {
        this.os = info
    }

    handleUpdateGpu(info: GpusInfo) {
        this.gpu = info
    }
}

export let systemStore = alt.createStore<SystemState>(SystemStore, "SystemStore")
export let auxillarySystemStore = alt.createStore<AuxState>(AuxillarySystemStore, "AuxillarySystemStore")
