
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

declare module "react-sortable-pane" {
    interface SortablePaneI extends __React.ComponentClass<{
        direction?: string, 
        margin?: number,
        onResize?: (id: number | string, direction: string, size: any, rect: any) => any,
        onOrderChange?: (panes: any) => any,
        [key: string]: any //fudge it for all the shit I left out
    }> {}
    interface PaneI extends __React.ComponentClass<{
        width: number,
        height: number,
        style?: __React.CSSProperties
    }> {}
    export const SortablePane: SortablePaneI
    export const Pane: PaneI
    
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

declare module "react-overlays" {
    interface AffixI extends __React.ComponentClass<{[key: string]: any}> {}
    interface AutoAffixI extends __React.ComponentClass<{[key: string]: any}> {}
    export const AutoAffix: AutoAffixI
    export const Affix: AffixI
}

declare module "aes" {
    let aesClass: any
    export = aesClass
}