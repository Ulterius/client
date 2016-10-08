
export default class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
    state: S
    bindListeners: (obj: any) => void
    bindAction: (action: any, handler: Function) => void
    exportPublicMethods: (config: {[key:string]: (...args:Array<any>) => any}) => any
    exportAsync: (source: any) => void
    waitFor: any
    exportConfig: any
    getState: () => S
    setState: (any) => void
}
