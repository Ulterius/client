import alt from "../alt"
import AbstractActions from "./abstract-actions"

interface Actions {
    updateStats(stats: SystemInfo): SystemInfo
    updateNet(net: NetworkInfo): NetworkInfo
    updateCPU(cpu: CpuInfo): CpuInfo
    updateOS(os: OSInfo): OSInfo
    updateGpu(gpus: GpusInfo): GpusInfo
    updateUser(user: UserInfo): UserInfo
}

class SystemActions extends AbstractActions implements Actions {

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

export let systemActions = alt.createActions<Actions>(SystemActions)
export default systemActions
