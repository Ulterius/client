import React = require("react")
import * as _ from "lodash"
import Component = React.Component

export let debugEvents = {
    debug(assignObject: any): any {}

}

interface DebugPanelState {
    debugObjects: {[key: string]: any}
}

export class DebugPanel extends Component<{}, DebugPanelState> {
    componentDidMount() {
        const {debugObjects} = this.state
        debugEvents.debug = (assignObject: any) => {
            this.setState({debugObjects: _.assign({}, debugObjects, assignObject)})
        }
    }
    componentWillUnmount() {
        debugEvents.debug = (name: string): any => {}
    }
    constructor() {
        super()
        this.state.debugObjects = []
    }
}