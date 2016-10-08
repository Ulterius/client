import {UlteriusConnection, getSenderFactory} from "../socket"
import {endpointMatch, lastPathSegment} from "../util"
import {scriptActions, messageActions} from "../action"
import {assign, mapValues} from "lodash"
import SI = ScriptInfo

function processLocalScript(script: SI.FullScript) {
    const {Type, ScriptContents, Name} = script
    let extension = ""
    if (Type == "cmd" && Name.indexOf(".cmd") == -1) {
        extension = ".cmd"
    }
    if (Type == "Powershell" && Name.indexOf(".ps1") == -1) {
        extension = ".ps1"
    }
    return assign({}, script, {
        Base64ScriptContents: btoa(ScriptContents),
        Name: Name + extension
    })
}

function processRemoteScript(script: SI.FullScript) {
    const seg = lastPathSegment(script.Name)
    return assign(script, {
        Name: seg.slice(0, seg.length-4)
    })
}

export function register(mC: UlteriusConnection) {
    mC.listenKeys(endpointMatch, {
        getAllJobs(results: ScriptInfo.Scripts) {
            console.log(results)
            scriptActions.getAllJobs(mapValues(results, processRemoteScript))
        },
        getJobContents(results: SI.Contents) {
            const {ScriptExist, Base64ScriptContents, Id} = results
            console.log(results)
            if (ScriptExist) {
                scriptActions.mergeFromServer({
                    Guid: results.Id,
                    ScriptContents: atob(results.Base64ScriptContents)
                })
            }
        },
        getJobDaemonStatus(results: SI.Daemon.Status) {
            console.log(results)
            scriptActions.getDaemonStatus(results.Online)
        },
        startJobDaemon(results: SI.Daemon.Started) {
            if (results.Started)
                scriptActions.getDaemonStatus(true)
        },
        stopJobDaemon(results: SI.Daemon.Stopped) {
            if (results.ShutDown)
                scriptActions.getDaemonStatus(false)
        },
        removeJob(results: SI.Removed) {
            if ((results.JobRemoved && results.JobExisted) || !results.JobExisted) {
                messageActions.msg("success", "Script deleted.")
                scriptActions.remove(results.Id)
            }
        }
    })

    const sendFn = getSenderFactory(mC)
    return {
        getAll: sendFn("getalljobs"),
        addOrUpdate(script: ScriptInfo.FullScript) {
            console.log(script)
            console.log(assign({}, script, {
                Base64ScriptContents: btoa(script.ScriptContents)
            }))
            mC.sendAsync(
                "addorupdatejob", 
                processLocalScript(script)
            ).then((updated: SI.Updated) => {
                console.log(updated)
                if (updated.AddedOrUpdated) {
                    messageActions.msg("success","Saved successfully.")
                    scriptActions.mergeFromServer(script)
                    console.log(script)
                }
                else {
                    messageActions.msg("danger", "Save failed.")
                }
            }).catch((e) => {
                messageActions.msg("danger", "Save timed out. Try again.")
            })
        },
        getContents: sendFn("getjobcontents") as (guid: string) => void,
        remove: sendFn("removejob") as (guid: string) => void,
        daemon: {
            start: sendFn("startjobdaemon"),
            stop: sendFn("stopjobdaemon"),
            getStatus: sendFn("getjobdaemonstatus")
        }
    }

    /*
    return {
        getAll() {
            mC.send("getalljobs")
        },
        addOrUpdate() {
            mC.send("addorupdatejob")
        },
        daemon: {
            start() {
                mC.send("startjobdaemon")
            },
            stop() {
                mC.send("stopjobdaemon")
            },
            getStatus() {
                mC.send("getjobdaemonstatus")
            }
        }        
    }
    */
}