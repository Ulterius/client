
declare module "react-chartist" {
    interface ChartistGraph extends __React.ComponentClass<{data?: any, type?: string, options?: any}> {}
    const Graph: ChartistGraph
    export = Graph
}

declare namespace ReactBootstrap {
    interface OverlayTrigger extends __React.ComponentClass<{
        trigger?: string,
        placement?: string,
        overlay?: __React.Component<any, any>
    }> {}
}

declare module "react-bootstrap" {
    export let OverLayTrigger: ReactBootstrap.OverlayTrigger
}
