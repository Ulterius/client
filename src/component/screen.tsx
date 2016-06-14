import React = require("react")
import Component = React.Component
import {Button} from "react-bootstrap"
import {Base64Img} from "./"
import {screenShareApi} from "../api/screen"

export let screenEvents = {
    frame(data: string) {}
}

export function ScreenPage() {
    return <div className="screen-page">
        <ScreenShare />
    </div>
}
window["debug"].counter = 0;
class ScreenShare extends Component<{}, {
    hasFrame: boolean
    frame?: string
}> {
    img: HTMLImageElement
    componentDidMount() {
        screenEvents.frame = (frame: string) => {
            window["debug"].counter++;
            //if (!this.state || !this.state.hasFrame) {
            //    this.setState({hasFrame: true})
            //}
            
            if (this.img) {
                this.img.src = `data:image/jpg;base64,${frame}`
            }
            
            //this.setState({frame})
            
        }
    }
    componentWillUnmount() {
        screenEvents.frame = () => {}
    }
    frameImg() {
        //if (this.state && this.state.hasFrame) {
            return <img ref={(ref) => this.img = ref} src="" />
            //<Base64Img type="image/jpg" data={this.state.frame} />
        //}
        //else {
        //    return null
        //}
    }
    render() {
        return <div>
            <Button onClick={() => {
                setInterval(() => {
                    screenShareApi.requestFrame()
                }, 50)
            }}/>
            {this.frameImg()}
        </div>
    }
}

