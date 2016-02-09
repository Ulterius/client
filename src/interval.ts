import {sendCommandToDefault} from "./socket"

interface Command {
    endPoint: string,
    time: number,
    args?: any
}

//retardo-constructor
function command(endPoint: string, time: number, args?): Command {
    return {endPoint, time, args}
}

export default function setIntervals() {
    let intervals: {[key: string]: number}
    intervals = setCommandIntervals([
        command("requestProcessInformation", 5000),
        command("requestSystemInformation", 1000),
    ])
    return intervals
    //this won't ever be called until the socket is guaranteed to be open
    //since it needs an auth response
}

function setCommandIntervals(commands: Command[]) {
    let intervals: {[key: string]: number} = {}
    for (let command of commands) {
        setCommandInterval(
            intervals,
            command.time,
            command.endPoint,
            command.args
        )
    }
    console.log(intervals)
    return intervals
}

function setCommandInterval(graftTo: any,
                            ms: number,
                            command: string,
                            args?) {
    sendCommandToDefault(command, args)
    graftTo[command] = setInterval( (() => sendCommandToDefault(command, args)), ms )
}
