import {cameraStore, CameraState, cameraUtil as cu} from "../store/camera-store"
import {Button, ButtonToolbar, Glyphicon} from "react-bootstrap"
import {sendCommandToDefault as sendCommand} from "../socket"
import {helpers as api} from "../api-layer"
import React = require("react")
import * as _ from "lodash"

export class CameraPage extends React.Component<{}, CameraState> {
    componentDidMount() {
        this.setState(cameraStore.getState())
        cameraStore.listen(this.onChange)
    }
    componentWillUnmount() {
        cameraStore.unlisten(this.onChange)
    }
    onChange = (state) => {
        this.setState(state)
    }
    toggleCamera(id: string) {
        if (cu(this.state).cameraIsActive(id)) {
            api.stopCamera(id)
        }
        else {
            api.startCamera(id)
        }
    }
    startCamera(id: string) {
        api.startCamera(id)
    }
    getButtonStyle(id: string) {
        return cu(this.state).cameraIsActive(id) ? "danger" : "success"
    }
    getIcon(id: string) {
        return cu(this.state).cameraIsActive(id) ? 
            <Glyphicon glyph="stop" /> : <Glyphicon glyph="play" />
    }
    render() {
        if (!this.state) return <div>No store...</div>
        
        let {cameras, activeCameras} = this.state
        return <div className="camera-page">
            <ButtonToolbar>
            {
                cameras.map(cam => {
                    return <Button 
                            onClick={() => this.toggleCamera(cam.Id)} 
                            bsStyle={this.getButtonStyle(cam.Id)}>
                        {this.getIcon(cam.Id)} {cam.Name}
                    </Button>
                })
            }
            </ButtonToolbar>
            {activeCameras.map(cam => {
                 return <img src={cam.URL} width="640" height="480" />
            })}
        </div>
    }
}