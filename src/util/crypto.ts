declare let JSEncrypt: any
import {generateHexString, arrayBufferToBase64} from "./"
import pako = require("pako")

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