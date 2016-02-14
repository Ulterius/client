import {settingsActions} from "../action"
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
export let changeWebServerUse = settingsActions.updateWebServer
export let changeNetworkResolve = settingsActions.updateNetworkResolve
export let changeTaskServerPort = settingsActions.updateTaskServerPort