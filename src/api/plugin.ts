import {pluginActions, messageActions} from "../action"

export function getPlugins(plugins: PluginInfo.Plugins) {
    pluginActions.updatePlugins(plugins)
}

export function plugin(response: PluginInfo.Started) {
    messageActions.plainMessage(`The plugin says: ${JSON.stringify(response.pluginData)}`)
}