import React = require("react")
import {Base64Img} from "./"
import {Glyphicon, Button, Input} from "react-bootstrap"

export class LoginScreen extends React.Component<{
    username?: string,
    avatar?: string,
    onLogin?: (pwd: string) => void
}, {
    password: string
}> {
    render() {
        const loginButton = 
            <Button 
            bsStyle="primary" 
            onClick={() => this.props.onLogin(this.state.password)}>
                <Glyphicon glyph="arrow-right" />
            </Button>
        return <div className="login">
            <Base64Img type="image/png" className="img-circle" data={this.props.avatar} />
            <h2>{this.props.username}</h2>
            <br />
            <Input 
                type="password" 
                placeholder="Password" 
                buttonAfter={loginButton} 
                onChange={(e) => this.setState({password: e.target.value})}
                onKeyDown={(e) => {
                    if (e.keyCode == 13) {
                        this.props.onLogin(this.state.password)
                    }
                }}/>
        </div>
    }
}