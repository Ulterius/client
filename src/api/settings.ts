import {settingsActions} from "../action"
import {sendCommandToDefault} from "../socket"

export function getCurrentSettings(settings: SettingsInfo.Settings) {
    console.log(settings)
    settingsActions.getAllSettings(settings)
    sendCommandToDefault("changeVncPort", 6670)
}

export function changeVncPort(port: SettingsInfo.VncPort) {
    settingsActions.updateVncPort(port)
}