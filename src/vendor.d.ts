
declare module "react-chartist" {
    interface ChartistGraph extends __React.ComponentClass<{data?: any, type?: string, options?: any}> {}
    const Graph: ChartistGraph
    export = Graph
}
