import * as _ from "lodash"
import React = require("react")
import classNames = require("classnames")

export function createSortOnProperty<T>(prop: string, how: string) {
    return function(a: T, b: T) {
        if (!_(a).has(prop) || !_(b).has(prop)) {
            throw new Error("One of the objects in the collection doesn't have the property!")
        }
        if (a[prop] > b[prop]) {
            return how == "asc" ? 1 : (-1)
        }
        else if (a[prop] < b[prop]) {
            return how == "asc" ? (-1) : 1
        }
        else {
            return 0
        }
    }
}

export function bytesToSize(bytes){
        if      (bytes >= 1000000000000) {bytes=(bytes/1000000000000).toFixed(2)+' TB';}
        else if (bytes>=1000000000)      {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)         {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)            {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)                {bytes=bytes+' bytes';}
        else if (bytes==1)               {bytes=bytes+' byte';}
        else                             {bytes='0 bytes';}
        return bytes;
}

export let GpuAvailability = {
    1: "Other",
    2: "Unknown",
    3: "Running",
    4: "Warning",
    5: "In Test",
    6: "N/A",
    7: "Power Off",
    8: "Offline",
    9: "Off Duty",
    10: "Degraded",
    11: "Not Installed",
    12: "Install Error",
    13: "Power Save - Unknown",
    14: "Power Save - Low Power Mode",
    15: "Power Save - Standby",
    16: "Power Cycle",
    17: "Power Save - Warning"
}

export let defaultIcon = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ+SURBVFhH7ZfbU1tVFMaZPvji9NV/wBn/Ct+xtlpLubTQa0qr1Bk6lYKA0JKE3AM0BKiU0BAuIRACxWq1WF9rIfWhT/pU3/AFyP3k5AKfa52TyymelItOfNA9880+7L3Z32+tvc7JORX/t3+9WWyDXdpeM8qpXqNVS9ZvkY5UGM3Wnd9erePlr7+TXv2j+qzDodozBJm/I0GYLP3Cz6tB/B2trr3AWvAXrL2QtUrXz2mMpbY+B/Au6e0KvcEqxBJJpFMiUmLyEJL/T1TR7rXsIaQyeYD3SEcJwCLwYDn1F4BMNitNrKw8w9OfXu5LKz8+QzaTlhQMBlWVj/z96xOS+FoVIJsD4I2ruxdQc9uP2p551OnmcMbgw1mTDw02Lxr6ZnDeMYULzklp7R/r60glEwWjUjoQwGXzMjTWh9DYltDYv4irjgCuORfw6cg8mkbncN3lw+fuWQVAXDV61r4A+I9tBUCz8zs0D3+LG/ce4eZ9kmsZLe6HuOVZQuv0Itq8AbTP+QsAaQLgjUVRkPuk3CvF5pX6YelaFSAuyBO8afv4E3S6f0Cn53t0TT/GF2R+w+1H07gXV8bc0LjG0TjhKgIICdXoWXkANj91z1YaIBoXCgA671PcmXmCxiEfTprH8IFxCB9aB3Giz4GP7g7gpLMPp0ZsCoBcBihy6fbjflcW2Lxhpmd/AC0PvsEJwygqe4dxzOzEcRuZ99/Fx4P9+GTYLm12+r5FARBTjZ6VB2DzpsfNpQFiCoBK3YgctYXMC1GT+YgdVV9bcXrMjJoHxiIA1YBID6MkHUXecLfY/M0AiSLAMVMu5Ry1g8yHKOUUddWoBdUuE2rdBpzx6AsAKToCtehZBwCQJ3jT43aKekCRco6aUl4zbkLdRC/OTupQTyktACTiB3qM7wmgLLSqUSuqKeW1lPI6D5lPaek87+C8r7sIQEegFj3rUADKQqvJp3xSj/rpHpzz3saFuS5c8ne8BpDK3QFqhru1J4Cy0KSUT+nkqGe7cXH+K1xa6IBmsa0AkKQa4AJUewDxmEBz0WgU4XAYkXBobwBlodVPaylqTnkXLvo7cTnQjitLbWhcvlUAEN9wG4pJ2pcAI5EwQqEQwqGtEgCKJ6Gy0M7Ncsopakq5JvAlmbfi6nILrj26qQCIqkafz0CCipQj39zcxNbWpjpAQpBfFCanFqWN96MJT0A+AjJQi56ViMcRi0bIeEsGIKkCRGJyBvi3nTc9iBKxYga453qIx2OI0jifO0e9sbEhqSRAKJoE/yRjO4W0GAeQBrI0lkogQ8K2SGM7pG0SreN5pLCTkYuMjWVzAXHKSIzMoxR5mM6ezz8vzkZJAJ4ol14D4Hf0bq0hyYOHkd5ohdFih8U+AJN1AAaTDTqVdUq1tLYPkbn8VkyNPxD4HZ0HmKocYi/5u4DakdwF0xwtk9hL/jL6j7eKij8B5gqtMNRO0PcAAAAASUVORK5CYII="

export function frameBufferToImageURL(buffer: number[]) {
    let bytes = new Uint8Array(buffer)
    let arrayBufferView = bytes;
    let blob = new Blob([arrayBufferView], {type: "image/jpeg"})
    let urlCreator = window.URL || (window as any).webkitURL
    return urlCreator.createObjectURL(blob)
}

export function byteArraysToBlobURL(buffers: Uint8Array[]) {
    let blob = new Blob(buffers, {type: "image/jpeg"})
    let urlCreator = window.URL || (window as any).webkitURL
    return urlCreator.createObjectURL(blob)
}


export const media = {
    xs: {
        max: 767
    },
    sm: {
        min: 768,
        max: 991
    },
    lg: {
        min: 992,
        max: 1199
    },
    xl: {
        min: 1200,
    }
}

export function px(pixels: number) {
    return `{number}px`
}

//return true if bootstrap will match the size, give a string like "xs", "sm", "md", "lg"
export function bootstrapSizeMatches(size: string) {
    return (  size == "xs" ||
             (size == "sm" && window.matchMedia("(min-width: 768px)").matches) ||
             (size == "md" && window.matchMedia("(min-width: 992px)").matches) ||
             (size == "lg" && window.matchMedia("(min-width: 1200px)").matches) )
}

export function lastPathSegment(path: string) {
    if (path.lastIndexOf("://") == path.length-4) {
        return path
    }
    return path.substr(path.lastIndexOf("\\")+1)
}

export function untilLastPathSegment(path: string) {
    return path.substr(0, path.lastIndexOf("\\"))
}

export function generateHexString(length: number) {
    let ret = ""
    while (ret.length < length) {
        ret += Math.random().toString(16).substring(2)
    }
    return ret.substring(0, length)
}

export function toHex(str: string) {
    let hex = ""
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16)
    }
    return hex
}

export function noOp() {}

//for jamming classes
export function stringIf(condition: boolean, subject: string) {
    return condition ? subject : ""
}

export function buildClassName(base: string, notEmpty: string, otherwise: string = "") {
    return !!base ? notEmpty : otherwise
}

//now this is just pure autism
//arcane sigil ternaries make my eyes bleed, so maybe I'll use this instead
export function ternary(condition, result1, result2) {
    return condition ? result1 : result2
}

export function workerAsync<T>(worker: Worker, type: string, content: T, callback: (any) => any ) {
    const listener = (e) => {
        if (e.data.type == type) {
            callback(e.data.content)
            worker.removeEventListener("message", listener)
        }
    }
    worker.addEventListener("message", listener)
    worker.postMessage({
        type,
        content
    })
}

export function workerListen(worker: Worker, callbacks: {[key: string]: Function}) {
    worker.addEventListener("message", ({data}) => {
        _.forOwn(callbacks, (callback, name) => {
            if (data.type == name) {
                callback(data.content)
            }
        })
    })
}

export function wrapWorker(worker: Worker) {
    return {
        listen(callbacks: { [key: string]: Function }) {
            workerListen(worker, callbacks)
        },
        post(type: string, content: any) {
            worker.postMessage({type, content})
        }
    }
}

export function wrapPostMessage(postMessage: typeof window.postMessage) {
    const pm = postMessage as any as (content: any, transferList?: any[]) => void
    return (type: string, content: any, transferList?: any[]) => {
        pm({
            type,
            content
        })
    }
}

export function getHandler(postMessage: typeof window.postMessage, addEventListener: typeof window.addEventListener) {
    let pm = postMessage as (any) => any
    return (type: string, fn: (any) => any) => {
        const listener = ({data}) => {
            if (data.type == type) {
                let content = fn(data.content)
                if (content) {
                    pm({type,content})
                }
            }
        }
        addEventListener("message", listener)
    }
}

export function downloadFile(file: FileSystemInfo.LoadedFile) {
    let url = frameBufferToImageURL(file.data)
    let a = document.createElement("a")
    a.href = url
    let as = (a as any)
    as.download = lastPathSegment(file.path)
    document.body.appendChild(a)
    a.style.display = "none"
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    //you didn't see anything
    //please forget this ever happened
}

export function downloadBlobURL(blob: string, name: string) {
    let a = document.createElement("a")
    a.href = blob
    let as = (a as any)
    as.download = name
    document.body.appendChild(a)
    a.style.display = "none"
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blob)
}

export function percentToNumber(percent: string) {
    return ( Number(percent.slice(0, -1))/100 )
} 

export function numberToPercent(num: number) {
    return String(num*100)+"%"
}

export function verticalCenter(width: number|string, height: number|string) {
    let negativeWidthOverTwo
    let negativeHeightOverTwo
    if (typeof width === "string") {
        negativeWidthOverTwo = numberToPercent(-percentToNumber(width)/2)
    }
    else {
        negativeWidthOverTwo = -width/2
    }
    if (typeof height === "string") {
        negativeHeightOverTwo = numberToPercent(-percentToNumber(height)/2)
    }
    else {
        negativeHeightOverTwo = -height/2
    }
    const style: React.CSSProperties = {
        position: "absolute",
        top: "50%",
        left: "50%",
        height,
        width,
        marginTop: negativeHeightOverTwo,
        marginLeft: negativeWidthOverTwo
    }
    return style
}


export function promiseChain(promises: Promise<any>[]) {
    let currentPromise
    console.log(promises)
    promises.forEach((promise, i) => {
        if (i == 0) {
            currentPromise = promise
        }
        else if (i > 0) {
            currentPromise = currentPromise.then(promise)
        }
        console.log(currentPromise)
    })
    return currentPromise
}

export function base64toArray(b64string: string) {
    let chars = atob(b64string)
    let numbers = new Array(chars.length)
    for (let i = 0; i < chars.length; i++) {
        numbers[i] = chars.charCodeAt(i);
    }
    return new Uint8Array(numbers)
}

export function toInt32(startIndex: number, bytes: ArrayLike<number>) {
    let i = startIndex
    return (bytes[i] << 24) | (bytes[i+1] << 16) | (bytes[i+2] << 8) | bytes[i+3] 
}

//credit to jonleighton
export function arrayBufferToBase64(arrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}

export function arrayToBase64(bytes: number[] | Uint8Array) {
    let uintBytes = new Uint8Array(bytes)
    let len = uintBytes.byteLength
    let binary = ""
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uintBytes[i])
    }
    return btoa(binary)
}

export function convertFromHex(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export function generatePassword() {
    let password = ""
    for (let i = 0; i < 16; i++) {
        password += String(_.random(0, 9, false))
    }
    console.log(password)
    return password
}

export function elementAfter<T>(arr: T[], element: T) {
    return arr[arr.indexOf(element) + 1]
}

export function tryUntil(
    predicate: () => boolean, 
    action: () => any, 
    delay: number = 1000
) {
    action()
    if (!predicate) {
        let interval = setInterval(() => {
            if (!predicate) {
                action()
            }
            if (predicate) {
                clearInterval(interval)
            }
        }, delay)
    }
}

export function clearFunctions(functionBag: {[key: string]: Function}) {
    _.forOwn(functionBag, (fn, name) => {
        functionBag[name] = () => {}
    })
}

export function addImageHeader(data: string) {
    return `data:image/jpg;base64,${data}`
}

export function caseInsensitiveMatch(s1: string, s2: string) {
    return s1.toLowerCase() == s2.toLowerCase()
}

export function endpointMatch(key: string, msg: any) {
    return ( msg.endpoint && caseInsensitiveMatch(msg.endpoint, key) )
}

export enum SocketType {
    Main = 0,
    ScreenShare,
    Terminal
}

export function isCameraFrame(data): data is CameraFrame {
    return typeof data.guid === "string" && typeof data.cameraImage === "string"
}

export function bytesToGuid(x) {
    var bytes = x
    .slice(0, 4)
    .reverse()
    .concat(x.slice(4,6).reverse()).concat(x.slice(6,8).reverse()).concat(x.slice(8))
    var y = bytes.map(function(item) {return ('00'+item.toString(16).toUpperCase()).substr(-2,2)})
    return y
}

export function ifEnter(callback: (e: React.KeyboardEvent) => any) {
    return (e: React.KeyboardEvent) => {
        if (e.keyCode == 13) {
            callback(e)
        }
    }
}

export function split(whole: {[key: string]: any}) {
    
}

interface hasClassName {
    className?: string
}

export function addClassName<T extends hasClassName>(original: T, newClass: any): T {
    return _.assign({}, original, {className: classNames(original.className, newClass)}) as T
}

export function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export function replace<T>(
    arr: T[], 
    predicate: (T, i?: number, arr?:T[]) => boolean, 
    replFn: (T, i?: number, arr?:T[]) => T
) {
    const matches = arr.filter(predicate)
    const indexes = matches.map(e => arr.indexOf(e))
    let newArray = arr.slice()
    matches.forEach((match, i) => {
        newArray[indexes[i]] = replFn(match, i, newArray)
    })
    return newArray
}

//immutable add element or assign to existing by predicate
export function addOrAssign<T>(
    list: T[],
    predicate: (T, i?: number, arr?: T[]) => boolean,
    replFn: (T, found?: boolean, i?: number, arr?: T[]) => any
) {
    const matches = list.filter(predicate)
    const indexes = matches.map(e => list.indexOf(e))
    let newList = list.slice()
    matches.forEach((match, i) => {
        const toAssign = replFn(match, true, i, newList)
        if (toAssign != undefined) {
            newList[indexes[i]] = _.assign({}, match, toAssign)
        }
        newList[indexes[i]] = _.assign({}, match, replFn(match, true, i, newList))
    })
    if (matches.length === 0) {
        const newElement = replFn({}, false, newList.length, newList)
        if (newElement != undefined) {
            newList.push(newElement)
        }
    }
    return newList
}