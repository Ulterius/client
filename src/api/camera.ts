import {mainConnection as _mainConnection} from "../socket"
import {isCameraFrame} from "../util"
import {decompressData} from "../util/crypto"
import {cameraActions} from "../action"

export function register(mC: typeof _mainConnection) {
    console.log("registering")
    mC.listen(msg => msg.endpoint && msg.endpoint.toLowerCase() == "cameraframe", (frame: CameraFrame) => {
        cameraActions.updateFrame({cameraId: frame.cameraId, URL: decompressData(new Uint8Array(frame.cameraData))})
    })
    return {

    }
}