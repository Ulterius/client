import {sendCommand} from "./socket"

export default function setIntervals(socket: WebSocket) {
    let intervals: {[key: string]: number}
    intervals = {}
    socket.onopen = function() {
        ["requestProcessInformation",
         "requestSystemInformation"].forEach(cmd => {
            setCommandInterval(
                intervals,
                socket,
                cmd,
                5000
            )
        })
    }
    return intervals
    //I know it's not async, but I don't think they'll be needed
    //until a good while after the socket is opened
    //pass by reference right? it should be fine.
}

function setCommandInterval(graftTo: any,
                            socket: WebSocket,
                            command: string,
                            ms: number) {
    graftTo[command] = setInterval( (() => sendCommand(socket, command)), ms )
}
