import alt from "../alt"
import AbstractActions from "./abstract-actions"

interface Actions {
    updateStats(stats: SystemInfo): SystemInfo
    updateNet(net: NetworkInfo): NetworkInfo
    updateCPU(cpu: CpuInfo): CpuInfo
    updateOS(os: OSInfo): OSInfo
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
}

export default alt.createActions<Actions>(SystemActions)
