declare let JSEncrypt: any
import {generateHexString} from "./"

export function generateKey(base64Key: string) {
    let encrypt = new JSEncrypt()
    encrypt.setPublicKey(atob(base64Key))
    let key = generateHexString(16)
    let iv = generateHexString(16)
    let encKey = encrypt.encrypt(key)
    let encIV = encrypt.encrypt(iv)
    
    return {key, iv, encKey, encIV}
}