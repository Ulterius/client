import {cameraStore, CameraState, cameraUtil as cu} from "../store/camera-store"
import {Button, ButtonToolbar, Glyphicon} from "react-bootstrap"
import {sendCommandToDefault as sendCommand, sendCommandAsync} from "../socket"
import {helpers as api} from "../api-layer"
import React = require("react")
import * as _ from "lodash"
import {SortablePane, Pane} from "react-sortable-pane"
import {DragGroup, DragElement} from "./"
import classNames = require("classnames")

const style = {
    fontSize: "40px",
    textAlign:"center",
    paddingTop:"60px",
    height:"400px",
    border: "solid 1px #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff"
}

export class CameraPage extends React.Component<{}, CameraState> {
    constructor(props) {
        super(props)
        this.state = {} as any
    }
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
            //api.stopCamera(id)
            /*
            sendCommandAsync("stopCamera", id, (result) => {
                console.log(result)
                //sendCommandAsync("stopCamera", id, () => {})
            })
            */
            sendCommand("stopCamera", id)
        }
        else {
            api.startCamera(id)
        }
    }
    startCamera(id: string) {
        api.startCamera(id)
    }
    refresh = () => {
        if (this.state.activeCameras.length == 0) {
            sendCommand("refreshCameras")
        }
    }
    getButtonStyle(id: string) {
        return cu(this.state).cameraIsActive(id) ? "danger" : "success"
    }
    getIcon(id: string) {
        return cu(this.state).cameraIsActive(id) ? 
            <Glyphicon glyph="stop" /> : <Glyphicon glyph="play" />
    }
    getCam(id: string) {
        let active = _.find(this.state.activeCameras, cam => cam.cameraId == id)
        
        if (active) {
            return <img key={active.cameraId} 
            src={active.URL} 
            style={{display: "inline",margin: 0, padding: 0, width: "100%", verticalAlign: "top"}}/>
        }
        else {
            let cam = _.find(this.state.cameras, cam => cam.Id == id)
            return <div style={{margin: 0, padding: 0, width: "100%", height: "100%", verticalAlign: "top"}}></div>
            /*
            return <Button 
                    key={cam.Id}
                    onClick={() => this.toggleCamera(cam.Id)} 
                    bsStyle={this.getButtonStyle(cam.Id)}>
                {this.getIcon(cam.Id)} {cam.Name}
            </Button>
            */
        }
    }
    getCamAtomic(id: string) {
        return _.find(this.state.activeCameras, cam => cam.cameraId == id)
    }
    render() {
        if (!this.state.cameras) {
            return <div>Loading...</div>
        }
            
        
        let {cameras, activeCameras} = this.state
        
        return <div className="camera-page">
            {cameras.length == 0 ? "No cameras found." : null}
            <DragGroup>
                {cameras.map(cam => {
                    let active = cu(this.state).cameraIsActive(cam.Id)
                    let icon = <span className={classNames(
                        "glyphicon", 
                        {
                            "glyphicon-stop": active,
                            "glyphicon-play": !active
                        }
                    )} />
                    return <div className="ulterius-panel" style={{width: 400, height: "300px", margin: 10}}>
                        <div className="camera-header" onClick={() => this.toggleCamera(cam.Id)}>
                            <div>{cam.Name}</div>
                            <div>{icon}</div>
                        </div>
                        {this.getCam(cam.Id)}
                    </div>
                })}
            </DragGroup>
        </div>
    }
}