import * as _ from "lodash"

//global event emitter for components that shouldn't need stores

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

//return true if bootstrap will match the size, give a string like "xs", "sm", "md", "lg"
export function bootstrapSizeMatches(size: string) {
    return (  size == "xs" ||
             (size == "sm" && window.matchMedia("(min-width: 768px)").matches) ||
             (size == "md" && window.matchMedia("(min-width: 992px)").matches) ||
             (size == "lg" && window.matchMedia("(min-width: 1200px)").matches) )
}

export function lastPathSegment(path: string) {
    return path.substr(path.lastIndexOf("\\")+1)
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

export function getHandler(postMessage: typeof window.postMessage, addEventListener: typeof window.addEventListener) {
    let pm = postMessage as (any) => any
    let ae = addEventListener
    return (type: string, fn: (any) => any) => {
        const listener = ({data}) => {
            if (data.type == type) {
                let content = fn(data.content)
                if (content) {
                    pm({type,content})
                }
            }
        }
        ae("message", listener)
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
