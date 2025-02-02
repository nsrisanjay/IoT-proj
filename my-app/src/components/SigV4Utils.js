// src/SigV4Utils.js
import CryptoJS from 'crypto-js';

export default class SigV4Utils {
  static getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate);
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion);
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
    return kSigning;
  }

  static getSignedUrl(protocol, host, port, accessKey, secretKey, sessionToken) {
    const time = new Date();
    const amzdate = time.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const datestamp = amzdate.slice(0, 8);

    const service = 'iotdevicegateway';
    const region = 'us-east-1'; // Your AWS region
    const algorithm = 'AWS4-HMAC-SHA256';
    const method = 'GET';
    const canonicalUri = '/mqtt';
    const hostHeader = host;
    const credentialScope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request';

    const canonicalQuerystring = 'X-Amz-Algorithm=' + algorithm;
    const credential = encodeURIComponent(accessKey + '/' + credentialScope);
    const canonicalQuerystringWithCredential = canonicalQuerystring + '&X-Amz-Credential=' + credential;
    const canonicalQuerystringWithDate = canonicalQuerystringWithCredential + '&X-Amz-Date=' + amzdate;
    const signedHeaders = 'host';
    const canonicalHeaders = 'host:' + hostHeader + '\n';
    const payloadHash = CryptoJS.SHA256('').toString(CryptoJS.enc.Hex);
    const canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystringWithDate + '\n' + canonicalHeaders + '\n' + signedHeaders + '\n' + payloadHash;
    const stringToSign = algorithm + '\n' + amzdate + '\n' + credentialScope + '\n' + CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
    const signingKey = SigV4Utils.getSignatureKey(secretKey, datestamp, region, service);
    const signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);

    let finalQuerystring = canonicalQuerystringWithDate + '&X-Amz-SignedHeaders=' + signedHeaders + '&X-Amz-Signature=' + signature;
    if (sessionToken) {
      finalQuerystring += '&X-Amz-Security-Token=' + encodeURIComponent(sessionToken);
    }

    return protocol + '://' + host + ':' + port + canonicalUri + '?' + finalQuerystring;
  }
}
