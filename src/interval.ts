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
    socket.onopen = function() {
        intervals = setCommandIntervals(socket, [
            command("requestProcessInformation", 5000),
            command("requestSystemInformation", 10000)
        ])
    }
    return intervals
    //I know it's not async, but I don't think they'll be needed
    //until a good while after the socket is opened
    //pass by reference right? it should be fine.
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
