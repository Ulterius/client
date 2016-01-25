import {sendCommand} from "./socket"

interface Command {
    endPoint: string,
    time: number,
    args?: any
}

//retardo-constructor
function command(endPoint: string, time: number, args?): Command {
    return {endPoint, time, args}
}

export default function setIntervals(socket: WebSocket) {
    let intervals: {[key: string]: number}
    intervals = setCommandIntervals(socket, [
        command("requestProcessInformation", 5000),
        command("requestSystemInformation", 1000),
    ])
    return intervals
    //this won't ever be called until the socket is guaranteed to be open
    //since it needs an auth response
}

function setCommandIntervals(socket: WebSocket, commands: Command[]) {
    let intervals: {[key: string]: number} = {}
    for (let command of commands) {
        setCommandInterval(
            intervals,
            socket,
            command.time,
            command.endPoint,
            command.args
        )
    }
    return intervals
}

function setCommandInterval(graftTo: any,
                            socket: WebSocket,
                            ms: number,
                            command: string,
                            args?) {
    sendCommand(socket, command, args)
    graftTo[command] = setInterval( (() => sendCommand(socket, command, args)), ms )
}
