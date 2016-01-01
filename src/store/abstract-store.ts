
export default class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
    bindListeners:(obj:any)=> void;
    exportPublicMethods:(config:{[key:string]:(...args:Array<any>) => any}) => any;
    exportAsync:( source:any) => void;
    waitFor:any;
    exportConfig:any;
    getState:() => S;
}
