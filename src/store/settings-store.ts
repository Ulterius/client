import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {settingsActions, messageActions} from "../action"
import * as _ from "lodash"

export interface SettingsState {
    settings: SettingsInfo.All
}

class SettingsStore extends AbstractStoreModel<SettingsState> {
    settings: SettingsInfo.All
    constructor() {
        super()
        this.settings = {} as any
        this.bindListeners({
            updateSetting: settingsActions.updateSetting,
            updateAllSettings: settingsActions.updateAllSettings
        })
    }
    updateAllSettings(allSettings: SettingsInfo.All) {
        this.settings = allSettings
    }
    updateSetting(setting: any) {
        const newSettingKey = Object.keys(setting)[0]
        _.forOwn(this.settings, (subsettings, category) => {
            if (_.has(subsettings, newSettingKey)) {
                _.assign(subsettings, setting)
            }
        })
        /*
        if (!this.settings) {
            this.settings = {} as any
        }
        if (_.has(whichever, "changedStatus")) {
            if (whichever.changedStatus) {
                let toChange = _.omit(whichever, ["changedStatus"])
                _.assign(this.settings, toChange)
            }
        }
        else {
            _.assign(this.settings, whichever)
            console.log(this.settings)
        }
        console.log("Setting updated: "+JSON.stringify(whichever))
        */
    }
}

export let settingsStore = alt.createStore<SettingsState>(SettingsStore, "SettingsStore")