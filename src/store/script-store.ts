import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {scriptActions} from "../action"
import {find, forOwn, assign, curry, concat, without} from "lodash"
import {createGuid, replace, addOrAssign} from "../util"
import * as _ from "lodash"
import {scriptApi as api} from "../api-layer"
import SI = ScriptInfo

export interface ScriptState {
    scripts?: SI.FullScript[],
    daemonRunning?: boolean,
    activeScriptId?: string
}

export function scriptById(scriptList: SI.FullScript[], id: string) {
    return find(scriptList, script => script.Guid == id)
}

export function activeScriptOf<T extends ScriptState>(ss: T) {
    return scriptById(ss.scripts, ss.activeScriptId)
}

export const scriptEqual = (script: SI.FullScript) => (otherScript: SI.FullScript) => (
    script.Guid == otherScript.Guid
)

export const scriptHasId = (id: string) => (script: SI.FullScript) => (
    script.Guid == id
)


export function blankScript(): SI.FullScript {
    return {
        Guid: createGuid(),
        Name: "New script",
        Schedule: "* * * * *",
        Type: "cmd",
        ScriptContents: "",
        dirty: true
    }
}

class ScriptStore extends AbstractStoreModel<ScriptState> {
    scripts: SI.FullScript[] = []
    daemonRunning: boolean = false
    activeScriptId: string
    constructor() {
        super()
        this.state = {
            scripts: [],
            daemonRunning: false,
            activeScriptId: undefined
        }
        this.bindListeners({
            handleGetAllJobs: scriptActions.getAllJobs,
            handleMergeFromServer: scriptActions.mergeFromServer,
            handleMergeLocally: scriptActions.mergeLocally,
            handleGetDaemonStatus: scriptActions.getDaemonStatus,
            handleSetActive: scriptActions.setActive,
            handleRemove: scriptActions.remove
        })
    }
    mergeScript = (clobber: boolean, tarnish: boolean) => (
        (newScript: SI.Script, id: string) => {
            const newScripts = addOrAssign(this.state.scripts, 
                scriptHasId(id), 
                (script, found) => {
                    if (found) {
                        if (!script.dirty || clobber) {
                            console.log(newScript)
                            return assign(newScript, {dirty: tarnish})
                        }
                    }
                    else {
                        console.log(newScript)
                        return assign(newScript, {
                            Guid: id,
                            dirty: tarnish,
                            ScriptContents: (newScript as SI.FullScript).ScriptContents || ""
                        })
                    }
                }
            )
            this.setState({scripts: newScripts})
            /*
            const existingScript = scriptById(this.state.scripts, id)
            if (existingScript && (!existingScript.dirty || clobber)) {
                const newScripts = replace(
                    this.state.scripts, 
                    scriptEqual(existingScript), 
                    script => assign({}, script, newScript, {dirty: tarnish})
                )
                this.setState({scripts: newScripts})
                //assign(existingScript, newScript, {dirty: tarnish})
            }
            else {
                this.setState({
                    scripts: this.state.scripts.concat(
                        assign({}, newScript, {
                            Guid: id, 
                            dirty: tarnish,
                            ScriptContents: ""
                        })
                    )
                })
                //this.scripts.push(assign({}, newScript, {Guid: id, dirty: tarnish}))
            }
            */
        }
    )
    scriptById(id: string) {
        return scriptById(this.state.scripts, id)
    }
    handleSetActive(id: string) {
        this.setState({activeScriptId: id})
        const {scripts, activeScriptId} = this.state
        const script = scriptById(scripts, id)
        if (script.ScriptContents == "" && !script.dirty) {
            api.getContents(id)
        }
    }
    handleGetAllJobs(scripts: SI.Scripts) {
        forOwn(scripts, this.mergeScript(false, false))
    }
    handleMergeFromServer(script: SI.FullScript) {
        this.mergeScript(true, false)(script, script.Guid)
    }
    handleMergeLocally(script: SI.FullScript) {
        this.mergeScript(true, true)(script, script.Guid)
    }
    handleGetDaemonStatus(status: boolean) {
        this.setState({daemonRunning: status})
    }
    handleRemove(id: string) {
        const {scripts} = this.state
        let scriptToDelete = this.scriptById(id)
        let indexOfScript = scripts.indexOf(scriptToDelete)
        if (indexOfScript > 0) {
            this.setState({activeScriptId: scripts[indexOfScript-1].Guid})
        }
        else {
            this.setState({activeScriptId: undefined})
        }
        this.setState({scripts: _.reject(this.state.scripts, scriptHasId(id))})
    }
}

export let scriptStore = alt.createStore<ScriptState>(ScriptStore, "ScriptStore")