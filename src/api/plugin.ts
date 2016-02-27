import {pluginActions} from "../action"

export function getPlugins(plugins: PluginInfo.Plugins) {
    pluginActions.updatePlugins(plugins)
}