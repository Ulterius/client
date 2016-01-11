import alt from "../alt"
import AbstractActions from "./abstract-actions"

interface Actions {
    updateStats(stats: SystemInfo): SystemInfo
    updateNet(net: NetworkInfo): NetworkInfo
}

class SystemActions extends AbstractActions implements Actions {

    updateStats(stats: SystemInfo) {
        return stats
    }
    updateNet(net: NetworkInfo) {
        return net
    }
}

export default alt.createActions<Actions>(SystemActions)
