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
