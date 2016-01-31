import alt from "../alt"
import AbstractActions from "./abstract-actions"
import {frameBufferToImageURL} from "../util"

interface Actions {
    updateCameras(cams: CameraInfos): CameraInfo[]
    updateFrame(frame: CameraFrame): CameraImage,
    startCameraStream(Id: string): string
    stopCameraStream(Id: string): string
}

class CameraActions extends AbstractActions implements Actions {
    
    updateCameras(cams: CameraInfos) {
        return cams.cameraInfo
    }
    
    updateFrame(frame: CameraFrame) {
        return {
            cameraId: frame.cameraId,
            URL: frameBufferToImageURL(frame.cameraFrame)
        }
    }
    startCameraStream(Id: string) {
        return Id
    }
    stopCameraStream(Id: string) {
        return Id
    }
    
}

export let cameraActions = alt.createActions<Actions>(CameraActions)