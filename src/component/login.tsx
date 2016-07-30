import React = require("react")
import {Base64Img} from "./"
import {Glyphicon, Button, Input} from "react-bootstrap"
import {connect, disconnect} from "../socket"
import {appActions} from "../action"
import {verticalCenter, media, clearFunctions} from "../util"
import config from "../config"
import MediaQuery = require("react-responsive")

export let loginEvents = {
    fail(text: string) {}
}

export class LoginScreen extends React.Component<{
    username?: string,
    avatar?: string,
    onLogin?: (pwd: string) => void
}, {
    password?: string,
    message?: string,
}> {
    constructor(props, context) {
        super(props, context)
        this.state = {
            password: ""
        }
    }
    componentDidMount() {
        loginEvents.fail = (text: string) => {
            this.setState({message: text})
        }
    }
    componentWillUnmount() {
        clearFunctions(loginEvents)
    }
    message(text: string) {
        if (text) {
            return <div className="login-message error-message">
                {text}
            </div>
        }
        return null;
    }
    inner() {
        const loginButton = 
            <Button 
            bsStyle="primary" 
            onClick={() => this.props.onLogin(this.state.password)}>
                {/*<Glyphicon glyph="arrow-right" />*/}
                Login
            </Button>
        return <div className="login-panel">
            <div className="ulterius-banner">
                <img src="img/logo.png" /> <br />
                login to ulterius
            </div>
            {this.message(this.state.message)}
            <div className="login-portrait">
                <Base64Img type="image/png" style={{width: 50, height: 50}} className="img-circle" data={this.props.avatar} /> <br />
                {this.props.username}
            </div>
            <div className="login-body">
                <div style={{width: "100%"}}>
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        onChange={(e) => this.setState({password: (e.target as HTMLInputElement).value})}
                        onKeyDown={(e) => {
                            if (e.keyCode == 13) {
                                this.props.onLogin(this.state.password)
                            }
                        }}
                    />
                </div>
            </div>
            <div className="login-foot">
                {loginButton}
                <Button bsStyle="link" onClick={disconnect}>Disconnect</Button>
            </div>
        </div>
    }
    render() {
        const loginButton = 
            <Button 
            bsStyle="primary" 
            onClick={() => this.props.onLogin(this.state.password)}>
                <Glyphicon glyph="arrow-right" />
            </Button>
        /*
        return <div style={_.assign(verticalCenter(300, 350), {textAlign: "center", display: "table-cell", verticalAlign: "middle"})}>
            <Base64Img type="image/png" style={{width: 50, height: 50}} className="img-circle" data={this.props.avatar} />
            <h2>{this.props.username}</h2>
            <br />
            <Input 
                type="password" 
                placeholder="Password" 
                buttonAfter={loginButton} 
                onChange={(e) => this.setState({password: (e.target as HTMLInputElement).value})}
                onKeyDown={(e) => {
                    if (e.keyCode == 13) {
                        this.props.onLogin(this.state.password)
                    }
                }}/>
            <br />
            <Button bsStyle="link" onClick={disconnect}><Glyphicon glyph="arrow-left" /> &nbsp; Disconnect</Button>
        </div>
        */
        return <div style={verticalCenter(300, 350)}>
            {this.inner()}
        </div>
    }
}

export class ConnectScreen extends React.Component<{}, {
    host?: string,
    port?: string,
    message?: string
}> {
    constructor(props, context) {
        super(props, context)
        this.state = {
            host: "localhost",
            port: "22007"
        }
    }
    componentDidMount() {
        if (config.autoConnect) {
            let {host, port} = config.autoConnect as any
            this.setState({host, port})
            connect(host, port)
        }
        loginEvents.fail = (text: string) => {
            this.setState({message: text})
        }
    }
    componentWillUnmount() {
        clearFunctions(loginEvents)
    }
    message(text: string) {
        if (text) {
            return <div className="login-message error-message">
                {text}
            </div>
        }
        return null;
    }
    inner() {
        return <div className="login-panel" >
            <div className="ulterius-banner">
                <img src="img/logo.png" /> <br />
                connect to ulterius
            </div>
            {this.message(this.state.message)}
            <div className="login-body">
                <div className="hostname">
                    <Input type="text" defaultValue="localhost" placeholder="host" onChange={e => 
                        this.setState({host: (e.target as HTMLInputElement).value})
                    } />
                </div>
                <div className="port">
                    <Input type="text" defaultValue="22007" placeholder="port" onChange={e => 
                        this.setState({port: (e.target as HTMLInputElement).value})
                    } />
                </div>
                <br />
            </div>
            <div className="login-foot">
                <Button bsStyle="primary" onClick={() => 
                    connect(this.state.host, this.state.port)
                }>
                    Connect
                </Button>
            </div>
        </div>
    }
    render() {
        
        return <div>
            <MediaQuery minWidth={media.sm.min}>
                <div style={_.assign(verticalCenter(400, 200))}>
                    {this.inner()}
                </div>
            </MediaQuery>
            <MediaQuery maxWidth={media.xs.max}>
                <div style={_.assign(verticalCenter("80%", 300))}>
                    {this.inner()}
                </div>
            </MediaQuery>
        </div>
        
        
        /*
        return <div style={{display: "table-cell", verticalAlign: "middle"}}>
            <h1>Connect to Ulterius</h1>
            <br />
            <div className="row">
                <div className="col-sm-8">
                    <Input type="text" defaultValue="localhost" placeholder="host" onChange={e => this.setState({host: e.target.value})} />
                </div>
                <div className="col-sm-4">
                    <Input type="text" defaultValue="22007" placeholder="port" onChange={e => this.setState({port: e.target.value})} />
                </div>
            </div>
            <Button bsStyle="primary" onClick={() => connect(this.state.host, this.state.port)}><Glyphicon glyph="arrow-right" /></Button>
        </div>
        */
    }
}