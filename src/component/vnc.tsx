import React = require("react")
import noVNC = require("novnc-node")
import {vncApi} from "../api-layer"
import {appStore} from "../store"
//let rfb = new noVNC.RFB({})

export class VncViewer extends React.Component<{}, {}> {
    target: HTMLCanvasElement
    rfb: RFB_Instance
    componentDidMount() {
        console.log(noVNC)
        this.rfb = new noVNC.RFB({target: this.target})
        vncApi.start((result) => {
            console.log(result)
            this.rfb.connect(`ws://${appStore.getState().connection.host}:${result.proxyPort}`)
            //this.rfb.get_display()
        })
    }
    componentWillUnmount() {
        this.rfb.disconnect()
    }
    render() {
        return <div>
            <canvas width={600} height={300} ref={ref => this.target = ref}>
            </canvas>
        </div>
    }
}

export function VncPage() {
    return <VncViewer />
}