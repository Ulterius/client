import {sendCommandAsync} from "../socket"

export let vncApi = {
    start(callback: (info?: VncInfo) => any) {
        sendCommandAsync("startvncserver", callback)
    },
    stop() {
        sendCommandAsync("stopvncserver", console.log.bind(console))
    }
}