import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {appActions} from "../action"

export interface AppState {
    auth: {
        loggedIn: boolean
    }
}

class AppStore extends AbstractStoreModel<AppState> {
    auth: {loggedIn: boolean}
    constructor() {
        super()
        this.auth = {loggedIn: false}
        this.bindListeners({
            handleLogin: appActions.login
        })
    }
    handleLogin(loggedIn: boolean) {
        this.auth.loggedIn = loggedIn
    }
}

export let appStore = alt.createStore<AppState>(AppStore, "AppStore")