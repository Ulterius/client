import AbstractActions from "./abstract-actions"
import alt from "../alt"

interface Actions {
    login(loggedIn: boolean): boolean
}

class AppActions extends AbstractActions implements Actions{
    login(loggedIn: boolean) {
        return loggedIn
    }
}

export let appActions = alt.createActions<Actions>(AppActions)