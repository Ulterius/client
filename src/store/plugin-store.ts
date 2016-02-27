import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {pluginActions} from "../action"
import * as _ from "lodash"

export interface PluginState {
    plugins: PluginInfo.Plugins,
    badPlugins: PluginInfo.Plugin[],
    pluginResponses: PluginInfo.Started[]
}

class PluginStore extends AbstractStoreModel<PluginState> {
    plugins: PluginInfo.Plugins
    pluginResponses: PluginInfo.Started[]
    constructor() {
        super()
        this.bindListeners({
            handleUpdatePlugins: pluginActions.updatePlugins,
            handleStartPlugin: pluginActions.startPlugin
        })
    }
    handleUpdatePlugins(plugins: PluginInfo.Plugins) {
        this.plugins = plugins;
    }
    handleStartPlugin(plugin: PluginInfo.Started) {
        this.pluginResponses.push(plugin);
    }
}

export let pluginStore = alt.createStore<PluginState>(PluginStore, "PluginStore")