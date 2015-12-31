

let socket = new WebSocket("ws://192.168.1.107:8387/")
export function connect() {
    try {
        console.log('Socket Status: ' + socket.readyState)

        socket.onopen = function() {
            console.log('Socket Status: ' + socket.readyState + ' (open)')
        }

        socket.onmessage = function(e) {
            if (typeof e.data === "string") {
                console.log("String get: " + e.data)
            }
            else if (e.data instanceof ArrayBuffer) {
                console.log("ArrayBuffer get (for some reason): " + e.data)
            }
            else if (e.data instanceof Blob) {
                console.log("Blob get (for some reason): " + e.data)
            }
        }

    }
    catch (err) {
        console.log(err)
    }
    finally {

    }

}
