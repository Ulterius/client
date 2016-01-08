import * as _ from "lodash"


export function createSortOnProperty<T>(prop: string) {
    return function(a: T, b: T) {
        if (!_(a).has(prop) || !_(b).has(prop)) {
            throw new Error("One of the objects in the collection doesn't have the property!")
        }
        if (a[prop] > b[prop]) {
            return 1
        }
        else if (a[prop] < b[prop]) {
            return -1
        }
        else {
            return 0
        }
    }
}

export function bytesToSize(bytes){
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
}
