import {settingsActions, messageActions} from "../action"
import {sendCommandToDefault} from "../socket"



export function getCurrentSettings(settings: SettingsInfo.Settings) {
    console.log(settings)
    settingsActions.getAllSettings(settings)
    sendCommandToDefault("changeVncPort", 6690)
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