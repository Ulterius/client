import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import systemActions from "../action/system-actions"

interface State {
    stats: SystemInfo
}

class SystemStore extends AbstractStoreModel<State> {

    stats: SystemInfo

    constructor() {
        this.bindListeners({
            handleUpdateStats: systemActions.updateStats
        })
        super()
    }

    handleUpdateStats(stats: SystemInfo) {
        this.stats = stats
        console.log("System stats store is updating.")
    }
}

export let systemStore = alt.createStore<State>(SystemStore, "SystemStore")
