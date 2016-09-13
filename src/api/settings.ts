import {settingsActions, messageActions} from "../action"
import {sendCommandToDefault, mainConnection as _mainConnection} from "../socket"
import {endpointMatch} from "../util"

function getEndpoint(property: string) {
    if (property == "UseWebServer") return "changeWebServerUse"
    if (property == "SkipHostNameResolve") return "changeNetworkResolve"
    return "change" + property
}


export function register(mC: typeof _mainConnection) {
    mC.listenKeys(endpointMatch, {
        getCurrentSettings(settings: SettingsInfo.All) {
            console.log(settings)
            settingsActions.updateAllSettings(settings)
        },
        saveSettings(result: SettingsInfo.Changed) {
            if (result.changedStatus) {
                messageActions.message({style: "success", text: "Settings updated."})
            }
        }
    })
    return {
        getCurrentSettings() {
            mC.send("getCurrentSettings")
        },
        changeSettings(newSettings) {
            mC.send("savesettings", btoa(JSON.stringify(newSettings, null, 2)))
            /*
            _.forOwn(newSettings, (v, k) => {
                mC.send(getEndpoint(k), v)
            }) */
        },
        restartServer() {
            mC.send("restartServer")
        }
    }
}

/*
export function getCurrentSettings(settings: SettingsInfo.Settings) {
    console.log(settings)
    settingsActions.updateAllSettings(settings)
}

export let changeVncPort = settingsActions.updateVncPort
export let changeVncPassword = settingsActions.updateVncPass
export let changeVncProxyPort = settingsActions.updateVncProxyPort
export let changeWebFilePath = settingsActions.updateWebFilePath
export let changeWebServerPort = settingsActions.updateWebServerPort
export let changeWebServerUse = settingsActions.updateWebServer
export let changeNetworkResolve = settingsActions.updateNetworkResolve
export let changeTaskServerPort = settingsActions.updateTaskServerPort
export function restartServer(status: {serverRestarting: boolean}) {
    if (status.serverRestarting) {
        messageActions.message({style: "success", text: "Server is restarting."})
    }
}

export let settingsApi = {
    getEndpoint(property: string) {
        if (property == "UseWebServer") return "changeWebServerUse"
        if (property == "SkipHostNameResolve") return "changeNetworkResolve"
        return "change" + property
    },
    changeSetting(setting: string, newValue: any) {
        sendCommandToDefault(settingsApi.getEndpoint(setting), newValue)
    },
    restartServer() {
        sendCommandToDefault("restartServer")
    }
}
*/