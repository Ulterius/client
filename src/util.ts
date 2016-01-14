import * as _ from "lodash"


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
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
}

export let defaultIcon = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQ+SURBVFhH7ZfbU1tVFMaZPvji9NV/wBn/Ct+xtlpLubTQa0qr1Bk6lYKA0JKE3AM0BKiU0BAuIRACxWq1WF9rIfWhT/pU3/AFyP3k5AKfa52TyymelItOfNA9880+7L3Z32+tvc7JORX/t3+9WWyDXdpeM8qpXqNVS9ZvkY5UGM3Wnd9erePlr7+TXv2j+qzDodozBJm/I0GYLP3Cz6tB/B2trr3AWvAXrL2QtUrXz2mMpbY+B/Au6e0KvcEqxBJJpFMiUmLyEJL/T1TR7rXsIaQyeYD3SEcJwCLwYDn1F4BMNitNrKw8w9OfXu5LKz8+QzaTlhQMBlWVj/z96xOS+FoVIJsD4I2ruxdQc9uP2p551OnmcMbgw1mTDw02Lxr6ZnDeMYULzklp7R/r60glEwWjUjoQwGXzMjTWh9DYltDYv4irjgCuORfw6cg8mkbncN3lw+fuWQVAXDV61r4A+I9tBUCz8zs0D3+LG/ce4eZ9kmsZLe6HuOVZQuv0Itq8AbTP+QsAaQLgjUVRkPuk3CvF5pX6YelaFSAuyBO8afv4E3S6f0Cn53t0TT/GF2R+w+1H07gXV8bc0LjG0TjhKgIICdXoWXkANj91z1YaIBoXCgA671PcmXmCxiEfTprH8IFxCB9aB3Giz4GP7g7gpLMPp0ZsCoBcBihy6fbjflcW2Lxhpmd/AC0PvsEJwygqe4dxzOzEcRuZ99/Fx4P9+GTYLm12+r5FARBTjZ6VB2DzpsfNpQFiCoBK3YgctYXMC1GT+YgdVV9bcXrMjJoHxiIA1YBID6MkHUXecLfY/M0AiSLAMVMu5Ry1g8yHKOUUddWoBdUuE2rdBpzx6AsAKToCtehZBwCQJ3jT43aKekCRco6aUl4zbkLdRC/OTupQTyktACTiB3qM7wmgLLSqUSuqKeW1lPI6D5lPaek87+C8r7sIQEegFj3rUADKQqvJp3xSj/rpHpzz3saFuS5c8ne8BpDK3QFqhru1J4Cy0KSUT+nkqGe7cXH+K1xa6IBmsa0AkKQa4AJUewDxmEBz0WgU4XAYkXBobwBlodVPaylqTnkXLvo7cTnQjitLbWhcvlUAEN9wG4pJ2pcAI5EwQqEQwqGtEgCKJ6Gy0M7Ncsopakq5JvAlmbfi6nILrj26qQCIqkafz0CCipQj39zcxNbWpjpAQpBfFCanFqWN96MJT0A+AjJQi56ViMcRi0bIeEsGIKkCRGJyBvi3nTc9iBKxYga453qIx2OI0jifO0e9sbEhqSRAKJoE/yRjO4W0GAeQBrI0lkogQ8K2SGM7pG0SreN5pLCTkYuMjWVzAXHKSIzMoxR5mM6ezz8vzkZJAJ4ol14D4Hf0bq0hyYOHkd5ohdFih8U+AJN1AAaTDTqVdUq1tLYPkbn8VkyNPxD4HZ0HmKocYi/5u4DakdwF0xwtk9hL/jL6j7eKij8B5gqtMNRO0PcAAAAASUVORK5CYII="
