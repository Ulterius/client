import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {appActions} from "../action"

export interface AppState {
    auth: {
        loggedIn: boolean,
        password: string
    }
}

class AppStore extends AbstractStoreModel<AppState> {
    auth: {loggedIn: boolean, password: string}
    constructor() {
        super()
        this.auth = {loggedIn: false, password: ""}
        this.bindListeners({
            handleLogin: appActions.login,
            handleSetPassword: appActions.setPassword
        })
    }
    handleLogin(loggedIn: boolean) {
        this.auth.loggedIn = loggedIn
    }
    handleSetPassword(password: string) {
        this.auth.password = password
    }
}

export let appStore = alt.createStore<AppState>(AppStore, "AppStore")