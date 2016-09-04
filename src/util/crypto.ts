declare let JSEncrypt: any

import {
	generateHexString, 
	arrayBufferToBase64,
	SocketType
} from "./"

import pako = require("pako")
import asmCrypto = require("asmcrypto.js")
import jDataView = require("jdataview")

export function generateKey(base64Key: string) {
    let encrypt = new JSEncrypt()
    encrypt.setPublicKey(atob(base64Key))
    let key = generateHexString(16)
    let iv = generateHexString(16)
    let encKey = encrypt.encrypt(key)
    let encIV = encrypt.encrypt(iv)
    
    return {key, iv, encKey, encIV}
}

export function hexStringtoArray(hexStr: string) {
    return new Uint8Array(
        hexStr.split("").map(num => Number("0x"+num))
    )
}

export let Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = (input.length/4) * 3;
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);
		
		return ab;
	},

	removePaddingChars: function(input){
		var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
		if(lkey == 64){
			return input.substring(0,input.length - 1);
		}
		return input;
	},

	decode: function (input: string, arrayBuffer?: ArrayBuffer) {
		//get last chars to see if are valid
		input = this.removePaddingChars(input);
		input = this.removePaddingChars(input);

		var bytes = parseInt(String((input.length/ 4) * 3), 10);
		
		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;
		
		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);
		
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
	
			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}
	
		return uarray;	
	}
}



export function ab2str(buf) {
  return String.fromCharCode.apply(null, buf);
}

export function decompressData(data: Uint8Array) {
	let inflated = pako.inflate(data)
	let blob = new Blob([inflated], {type: "image/jpeg"})
	return URL.createObjectURL(blob)
    //return arrayBufferToBase64(pako.inflate(data))
}




declare let require: (string) => any

let encoderShim = require("text-encoding")

/*
if (typeof TextEncoder === "undefined") {
    let encoding = require("text-encoding")
    TextEncoder = encoding.TextEncoder as typeof TextEncoder
    TextDecoder = encoding.TextDecoder as typeof TextDecoder
}
*/

/*
let encoder: TextEncoding.TextEncoder
let decoder: TextEncoding.TextDecoder
if (typeof TextEncoder === "undefined") {
    encoder = (new encoderShim.TextEncoder("utf-8") as TextEncoding.TextEncoder)
    decoder = (new encoderShim.TextDecoder("utf-8") as TextEncoding.TextDecoder)
}
else {
    encoder = new TextEncoder("utf-8")
    decoder = new TextDecoder("utf-8")
}
*/

export function getTextEncoder() {
    let encoder: TextEncoding.TextEncoder
    let decoder: TextEncoding.TextDecoder
    if (typeof TextEncoder === "undefined") {
        encoder = (new encoderShim.TextEncoder("utf-8") as TextEncoding.TextEncoder)
        decoder = (new encoderShim.TextDecoder("utf-8") as TextEncoding.TextDecoder)
    }
    else {
        encoder = new TextEncoder("utf-8")
        decoder = new TextDecoder("utf-8")
    }
    return {encoder, decoder}
}

let {encoder, decoder} = getTextEncoder()



export function encrypt(key, iv, packet) {
    let encodedPacket = encoder.encode(JSON.stringify(packet))
    let encryptedPacket = asmCrypto.AES_CBC.encrypt(
        encodedPacket,
        encoder.encode(key), 
        true,
        encoder.encode(iv)
    )
    return encryptedPacket
}

export function decrypt(key, iv, data, type, encryptionMode) {
    let decrypted
    let [encKey, encIv] = [encoder.encode(key), encoder.encode(iv)]

    if (encryptionMode.toLowerCase() == "ofb") {
        decrypted = asmCrypto.AES_OFB.decrypt(data, encKey, encIv)
    }
    else {
        decrypted = asmCrypto.AES_CBC.decrypt(data, encKey, true, encIv)
    }
    return decrypted
    /*
    let decoded = decoder.decode(decrypted)
    let ret
    try {
        ret = JSON.parse(decoded)
    }
    catch (errr) {
        try {
            if (type === SocketType.ScreenShare) {
                ret = unpackFrameData(decrypted)
            }
            else {
                ret = unpackCameraFrameData(decrypted)
            }
            
        }
        catch (e) {
            //means it's actually not ofb
            try {
                decrypted = asmCrypto.AES_CBC.decrypt(data, encKey, true, encIv)
                decoded = decoder.decode(decrypted)
                ret = JSON.parse(decoded)
            }
            catch (fuckingError) {
                console.log("Undecryptable packet recieved.")
                console.log(fuckingError)
                ret = new Uint8Array([])
            }
        }
    }
    return ret
    */
}

export function decodeJSON(data: Uint8Array) {
    return JSON.parse(decoder.decode(data))
}

export function unpackPacket(data: Uint8Array) {
    let v = new jDataView(data, 0, data.length, true)
    let epLen = v.getInt32()
    let endpoint = v.getString(epLen)
    let encryptionMode = v.getString(3)
    let body = data.subarray(4 + epLen + 3)
    return {endpoint, encryptionMode, body}
}

export function unpackFrameData(data: Uint8Array) {
    let fv = new jDataView(data, 0, data.length, true)
    //let uid = fv.getString(16)
    let x = fv.getInt32(16)
    let y = fv.getInt32()
    let top = fv.getInt32()
    let bottom = fv.getInt32()
    let left = fv.getInt32()
    let right = fv.getInt32()
    let image = decompressData(data.subarray(16 + (4*6)))
    return {
        x, y, top, bottom, left, right, image
    }
}

export function unpackCameraFrameData(data: Uint8Array) {
    let fv = new jDataView(data, 0, data.length, true)
    let guid = fv.getString(32)
    let cameraImage = decompressData(data.subarray(32))
    return {
        results: {
            guid, cameraImage
        }
    }
}
