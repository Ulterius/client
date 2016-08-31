import {Connection} from "../socket"
import {isCameraFrame, endpointMatch} from "../util"
import {decompressData} from "../util/crypto"
import {cameraActions, messageActions} from "../action"

export function register(mC: Connection) {
    console.log("registering camera listeners")
    mC.listenKeys<Connection>(endpointMatch, {
        getCameras(cams: CameraInfos) {
            cameraActions.updateCameras(cams)
        },
        cameraFrame(frame: CameraFrame) {
            cameraActions.updateFrame({
                cameraId: frame.cameraId, 
                URL: decompressData(new Uint8Array(frame.cameraData))
            })
        },
        startCamera(status: CameraStatus.Started) {
            if (status.cameraRunning) {
                mC.send("startcamerastream", status.cameraId)
            }
        },
        startCameraStream(status: CameraStatus.StreamStarted) {
            if (status.cameraStreamStarted) {
                cameraActions.startCameraStream(status.cameraId)
            }
        },
        stopCamera(status: CameraStatus.Stopped) {
            if (!status.cameraRunning) {
                cameraActions.stopCameraStream(status.cameraId)
            }
        },
        refreshCameras(status: CamerasRefreshed) {
            if (status.cameraFresh) {
                mC.send("getCameras")
            }
            messageActions.message({
                style: status.cameraFresh ? "success" : "danger",
                text: status.message
            })
        }
        /*
        stopCameraStream(status: CameraStatus.StreamStopped) {
            if (status.cameraStreamStopped) {
                cameraActions.stopCameraStream(status.cameraId)
            }
        },
        */
    })
    return {
        startCamera(id: string) {
            mC.send("startCamera", id)
        },
        stopCamera(id: string) {
            mC.send("stopCamera", id)
        },
        refreshCameras() {
            mC.send("refreshCameras")
        },
        getCameras() {
            mC.send("getCameras")
        }
    }
}