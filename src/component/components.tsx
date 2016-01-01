//yeah yeah I'll break this shit up later
//just testing things right now
import React = require("react")

export let Task = React.createClass<{ayy: string}, any>({
    render: function() {
        return (
            <p>
                {this.props.ayy}
            </p>
        )
    }
})
