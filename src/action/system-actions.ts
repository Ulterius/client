import alt from "../alt"
import AbstractActions from "./abstract-actions"

interface Actions {
    updateStats(stats: SystemInfo): SystemInfo
    updateNet(net: NetworkInfo): NetworkInfo
    updateCPU(cpu: CpuInfo): CpuInfo
    updateOS(os: OSInfo): OSInfo
    updateGpu(gpus: GpusInfo): GpusInfo
}

class SystemActions extends AbstractActions implements Actions {

    updateStats(stats: SystemInfo) {
        console.log(stats)
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
}

export default alt.createActions<Actions>(SystemActions)
