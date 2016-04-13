
declare module "react-chartist" {
    interface ChartistGraph extends __React.ComponentClass<{data?: any, type?: string, options?: any}> {}
    const Graph: ChartistGraph
    export = Graph
}
declare module "node-rsa" {
    const NodeRSA: any
    export = NodeRSA
}

declare module "react-responsive" {
    interface MediaQuery extends __React.ComponentClass<{
        query?: string,
        minDeviceWidth?: number,
        maxDeviceWidth?: number,
        minWidth?: number,
        maxWidth?: number,
        orientation?: string,
        minResolution?: string
    }> {}
    const Query: MediaQuery
    export = Query
}
/*
declare namespace ReactBootstrap {

    interface basicProps {
        bsClass?: string,
        bsSize?: string,
        bsStyle?: string
    }

    interface generalProps extends basicProps {
        [key: string]: any
    }

    interface Button extends __React.ComponentClass<{
        active?: boolean,
        block?: boolean,
        bsClass?: string,
        bsSize?: string,
        bsStyle?: string,
        componentClass?: __React.Component<any, any>,
        disabled?: boolean,
        href?: string,
        navDropdown: boolean,
        navItem: boolean,
        target: string,
        type: string

    }> {}

    interface OverlayTrigger extends __React.ComponentClass<{
        trigger?: string,
        placement?: string,
        overlay?: __React.Component<any, any>
    }> {}

    interface PopOver extends __React.ComponentClass<{

    }> {}
}

declare module "react-bootstrap" {
    export let OverLayTrigger: ReactBootstrap.OverlayTrigger
    export let Button: ReactBootstrap.Button
}
*/
