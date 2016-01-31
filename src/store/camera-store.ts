import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {cameraActions} from "../action/camera-actions"
import * as _ from "lodash"

export interface CameraState {
    cameras: CameraInfo[], 
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
    
    handleCameraImage(image: CameraImage) {
        if (this.cameraIsActive(image.cameraId)) {
            _.find(this.activeCameras, cam => cam.cameraId == image.cameraId).URL = image.URL
        }
    }
}


export let cameraStore = alt.createStore<CameraState>(CameraStore, "CameraStore")