import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {cameraActions} from "../action"
import * as _ from "lodash"

export interface CameraState {
    cameras: CameraInfo[], 
    noCameras: boolean,
    activeCameras: CameraImage[]
}

/*
export let cameraUtil = {
    cameraIsActive: function(state: CameraState, id: string) {
        return this.activeCameras.some(cam => cam.cameraId == id)
    }
}
*/
export let cameraUtil = function(state: CameraState) {
    return {
        cameraIsActive: function(id: string) {
            return state.activeCameras.some(cam => cam.cameraId == id)
        }
    }
}

class CameraStore extends AbstractStoreModel<CameraState> {
    cameras: CameraInfo[] = []
    activeCameras: CameraImage[] = []
    noCameras: boolean = false
    constructor() {
        super()
        this.bindListeners({
            handleUpdateCameras: cameraActions.updateCameras,
            handleStopCameraStream: cameraActions.stopCameraStream,
            handleStartCameraStream: cameraActions.startCameraStream,
            handleCameraImage: cameraActions.updateFrame
        })
    }
    
    cameraIsActive(id: string) {
        return this.activeCameras.some(cam => cam.cameraId == id)
    }
    
    handleUpdateCameras(cams: CameraInfo[]) {
        this.cameras = cams
        if (cams.length == 0) {
            this.noCameras = true
        }
    }
    
    handleStartCameraStream(id: string) {
        if (!this.cameraIsActive(id)) {
            this.activeCameras.push({cameraId: id, URL: ""})
        }
    }
    
    handleStopCameraStream(id: string) {
        if (this.cameraIsActive(id)) {
            _.remove(this.activeCameras, cam => cam.cameraId == id)
        }
    }
    
    handleCameraImage(frame: CameraImage) {
        if (this.cameraIsActive(frame.cameraId)) {
            _.find(this.activeCameras, cam => cam.cameraId == frame.cameraId).URL = frame.URL
        }
    }
}


export let cameraStore = alt.createStore<CameraState>(CameraStore, "CameraStore")