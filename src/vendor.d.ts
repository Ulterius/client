
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

declare interface RFB_Instance {
    connect(host: string, password?: string): void
    disconnect(): void
    sendPassword(password: string): void
    sendCtrlAltDel(): void
    sendKey(code: string, down?: boolean)
    clipboardPasteFrom(text: string): void
    get_display(): any
    [key: string]: any
}

declare module "novnc-node" {
    let Util: any
    let Keys: any
    let KbdUtil: any
    let Input: any
    let WebSock: any
    let Base64: any
    let DES: any
    let TINF: any
    let Display: any
    interface RFB_Class {
        new(config: any): RFB_Instance
    }
    let RFB: RFB_Class
    export = {
        Util,
        Keys,
        KbdUtil,
        Input,
        WebSock,
        Base64,
        DES,
        TINF,
        Display,
        RFB
    }
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

declare module "react-grid-layout" {
    interface ResponsiveReactGridLayoutI extends __React.ComponentClass<{
        className?: string,
        layouts: any,
        breakpoints?: any,
        cols?: any,
        [key: string]: any
    }> {}
    export const Responsive: ResponsiveReactGridLayoutI
    export const WidthProvider: (ResponsiveReactGridLayoutI) => ResponsiveReactGridLayoutI
}

declare module "simplecrypto" {
    interface Sym {
        decrypt: (keys: {aeskeyObj: any, iv?: any}) => any
    }
    let sym: Sym
    export = {
        sym
    }
}

declare module "asmcrypto.js" {
    type CryptoArrayLike = Uint8Array | ArrayBuffer
    interface CBCCryptFn {
        (
            data: CryptoArrayLike,
            key: CryptoArrayLike,
            padding?: boolean,
            iv?: CryptoArrayLike
        ): Uint8Array
    }
    interface OFBCryptFn {
        (
            data: CryptoArrayLike,
            key: CryptoArrayLike,
            iv?: CryptoArrayLike
        ): Uint8Array
    }
    let ex: {
        AES_CBC: {
            encrypt: CBCCryptFn,
            decrypt: CBCCryptFn,
            [key: string]: any
        },
        AES_OFB: {
            encrypt: OFBCryptFn,
            decrypt: OFBCryptFn,
            [key: string]: any
        }
    }
    export = ex
}

declare module "react-svg-gauge" {
    interface GaugeI extends __React.ComponentClass<{
        value: number, 
        label?: string,
        min?: number,
        max?: number,
        width?: number,
        height?: number,
        color?: string,
        backgroundColor?: string,
        topLabelStyle?: __React.CSSProperties,
        valueLabelStyle?: __React.CSSProperties,
        minMaxLabelStyle?: __React.CSSProperties
    }> {}
    let Gauge: GaugeI
    export default Gauge
}

declare module "react-json-tree" {
    interface JSONTreeI extends __React.ComponentClass<{
        data: any,
        theme?: any
    }> {}
    let JSONTree: JSONTreeI
    export default JSONTree
}