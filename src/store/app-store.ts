import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {appActions} from "../action"
import * as _ from "lodash"

export interface AppState {
    connection: {
        host: string,
        port: string,
        terminalPort: string,
        vncPort: string
    }
    auth: {
        loggedIn: boolean,
        password: string
    },
    crypto: {
        shook: boolean,
        key: string,
        iv: string
    }
}

class AppStore extends AbstractStoreModel<AppState> {
    connection: {
        host: string,
        port: string,
        terminalPort: string,
        vncPort: string
    } = {
        host: "",
        port: "",
        terminalPort: "",
        vncPort: ""
    }
    auth: {
        loggedIn: boolean,
        password: string
    } = {loggedIn: false, password: ""}
    crypto: {
        shook?: boolean,
        key?: string,
        iv?: string
    } = {}
    constructor() {
        super()
        this.bindListeners({
            handleLogin: appActions.login,
            handleSetPassword: appActions.setPassword,
            handleSetKey: appActions.setKey,
            handleSetShake: appActions.setShake,
            handleSetHost: appActions.setHost
        })
    }
    handleLogin(loggedIn: boolean) {
        this.auth.loggedIn = loggedIn
    }
    handleSetPassword(password: string) {
        this.auth.password = password
    }
    handleSetKey(key: KeyInfo) {
        _.assign(this.crypto, key)
    }
    handleSetShake(shook: boolean) {
        this.crypto.shook = shook
    }
    handleSetHost(host: HostInfo) {
        _.assign(this.connection, host)
    }
}

export let appStore = alt.createStore<AppState>(AppStore, "AppStore")