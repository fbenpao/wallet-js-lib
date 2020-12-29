const dagCBOR = require('ipld-dag-cbor')
const request = require("request")
const BigNumber = require('bignumber.js')
const multibase = require('multibase')
const blakejs = require('blakejs')
const secp256k1 = require('secp256k1')
const axios = require('axios')
const EC = require('elliptic').ec;
const LOTUS_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiXX0.InBrWZNoobt3dIrGWuNOQyzWfMcX6IfsFgoiDF0PDSU"
const ec = new EC('secp256k1');

const isDecimalString = (str) => {
    let num = BigNumber(str)
    let value = num.toString(10)
    return str == value
}

const getBalance = (address, url) => {
    console.log("打印getBalance的参数"+address+"  "+url)
    return new Promise((resolve, reject) => {
        let params = {
            "jsonrpc": "2.0",
            "method": "Filecoin.WalletBalance",
            "params": [address],
            "id": 1
        }
        let requestParams = {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(params)
        }

        axios({
            method: 'post',
            url:url,
            data:params,
            headers: {
                "content-type": "application/json"
            }
        }).then(res=>{
            console.log(res)
            resolve(res.data)
        })
        // request(url, requestParams, async (error, response, body) => {
        //     if (response && response.statusCode == 200) {
        //         let obj = JSON.parse(body)
        //         if (isDecimalString(obj.result)) {
        //             resolve(obj.result)
        //         } else {
        //             reject(obj.result)
        //         }
        //     } else if (body) {
        //         reject(body)
        //     } else {
        //         reject("error")
        //     }
        // })
    })
}


const getGasEstimateFeeCap = (from,to,url,gasPremium,gasLimit)=>{
    return new Promise(async(resolve, reject) => {
        let params = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "Filecoin.GasEstimateFeeCap",
            "params": [
                {
                    "From": from,
                    "To": to,
                    "GasPremium":gasPremium,
                    "GasLimit":gasLimit,
                    "Value": "1",
                    "Method": 0,

                },
                10,
                null
            ]
        }
        axios({
            method: 'post',
            url:url,
            data:params,
            headers: {
                "content-type": "application/json"
            }
        }).then(res=>{
            console.log(res)
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}

const getGasEstimateMessageGas = (from,to,url)=>{
    return new Promise(async(resolve, reject) => {
        let params = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "Filecoin.GasEstimateMessageGas",
            "params": [
                {
                    "Version": 0,
                    "From": from,
                    "To": to,
                    "Value": "1",
                    "Method": 0,
                    "Params": ""
                },
                {
                    "MaxFee": "1000000000000000"
                },
                null
            ]
        }
        axios({
            method: 'post',
            url:url,
            data:params,
            headers: {
                "content-type": "application/json"
            }
        }).then(res=>{
            // console.log(res)
            resolve(res)
        }).catch(err=>{
            reject(err)
        })
    })
}

const getGasEstimateGasPremium = (from,url)=>{
    return new Promise(async(resolve, reject) => {
    let params = {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "Filecoin.GasEstimateGasPremium",
        "params": [0, from, 100000, null]
    
    }
    axios({
        method: 'post',
        url:url,
        data:params,
        headers: {
            "content-type": "application/json"
        }
    }).then(res=>{
        console.log(res)
        resolve(res)
    }).catch(err=>{
        reject(err)
    })
  })
}

const getGasEstimateGasLimit = (from,to,url)=>{
    return new Promise(async(resolve, reject) => {
    let params = {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "Filecoin.GasEstimateGasLimit",
        "params": [
            {
                "From": from,
                "To": to,
                "Value": "1",
                "Method": 0
            },
            null
        ]
    }
    axios({
        method: 'post',
        url:url,
        data:params,
        headers: {
            "content-type": "application/json"
        }
    }).then(res=>{
        console.log(res)
        resolve(res)
    }).catch(err=>{
        reject(err)
    })
 })
}

const getNounce = (address, url) => {
    console.log("打印getNounce的参数"+address+"  "+url)
    return new Promise((resolve, reject) => {
        let params = {
            "jsonrpc": "2.0",
            "method": "Filecoin.MpoolGetNonce",
            "params": [address],
            "id": 1
        }
        let requestParams = {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(params)
        }
        request(url, requestParams, async (error, response, body) => {
            if (error) {
                reject(error)
                return
            }
            if (response && response.statusCode == 200) {
                let obj = JSON.parse(body)
                resolve(obj.result)
            } else if (body) {
                reject(body)
            } else {
                reject("error")
            }
        })
    })
}


const mpoolPush = (sigMsg, url) => {
    return new Promise((resolve, reject) => {
        try {
            let params = {
                "jsonrpc": "2.0",
                "method": "Filecoin.MpoolPush",
                "params": [sigMsg],
                "id": 1
            }
            console.log("url------------",url)
            console.log("mpoolPush参数--"+JSON.stringify(params))
            axios({
                method: 'post',
                url:url,
                data:params,
                headers: {
                    "content-type": "application/json",
                    "Authorization": LOTUS_TOKEN
                }
            }).then(res=>{
                console.log(res)
                resolve(res)
            }).catch(err=>{
                reject(err)
            })


            // let requestParams = {
            //     method: "POST",
            //     headers: {
            //         "content-type": "application/json",
            //         "Authorization": LOTUS_TOKEN
            //     },
            //     body: JSON.stringify(params)
            // }
            // console.log("mpoolPush方法参数--"+requestParams)
            // request(url, JSON.stringify(requestParams), async (error, response, body) => {
            //     if (response && response.statusCode == 200) {
            //         let obj = JSON.parse(body)
            //         let cid = obj.result
            //         resolve(cid)
            //     } else if (body) {
            //         reject(body)
            //     } else {
            //         reject("error")
            //     }
            // })
        } catch (error) {
            reject(error)
        }

    })

}

const waitMsg = (cid, url) => {
    return new Promise((resolve, reject) => {
        try {
            let params = {
                "jsonrpc": "2.0",
                "method": "Filecoin.StateWaitMsg",
                "params": [cid],
                "id": 1
            }
            let requestParams = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": LOTUS_TOKEN
                },
                body: JSON.stringify(params)
            }
            request(url, requestParams, async (error, response, body) => {
                if (response && response.statusCode == 200) {
                    let obj = JSON.parse(body)
                    let result = obj.result
                    resolve(result)
                } else if (body) {
                    reject(body)
                } else {
                    reject("error")
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

const getCIDByBuf = (buf) => {
    return new Promise((resolve, reject) => {
        let userOptions = {
            hashAlg: 45600
        }
        dagCBOR.util.cid(buf, userOptions).then(resolve)
    })
}

const serializeAddress = (address) => {
    return new Promise((resolve, reject) => {
        let payloadcksm = multibase.decode('b' + address.substring(2, address.length))
        // TODO: consider other type
        let payload = Buffer.concat([Buffer.from([Number(address.substring(1, 2))]), payloadcksm.slice(0, payloadcksm.length - 4)])
        let serialized = dagCBOR.util.serialize(payload)

        resolve(serialized)
    })
}

const serializeBigInt = (str) => {
    return new Promise((resolve, reject) => {
        let num = BigNumber(str)
        let serialized
        if (num.isZero()) {
            serialized = Buffer.from([64])
        } else {
            let u8a = multibase.decode("9" + num.toString(10))
            let head = 64 + u8a.length + 1
            serialized = Buffer.concat([Buffer.from([head, 0]), u8a])
        }
        resolve(serialized)
    })
}

const serializeParams = (params) => {
    return new Promise((resolve, reject) => {
        let serialized
        if (!params || params.length == 0) {
            serialized = Buffer.from([64])
        } else {
            //TODO
            let u8a = multibase.decode("M" + params)
            let l = u8a.length
            let head = []
            if (l < 24) {
                head = Buffer.from([64 + l])
            } else if (l < 1 << 8) {
                head = Buffer.from([88, l])
            } else if (l < 1 << 16) {
                head = Buffer.from([89, l >> 8, l % 256])
            } else {
                reject("not support yet")
            }
            serialized = Buffer.concat([head, u8a])
        }
        resolve(serialized)
    })
}

// const getMessageCID = async (msg) => {
//     return new Promise(async (resolve, reject) => {
//         let buf = Buffer.from([136])

//         let to = await serializeAddress(msg.To)
//         let from = await serializeAddress(msg.From)
//         let nonce = dagCBOR.util.serialize(msg.Nonce)
//         let value = await serializeBigInt(msg.Value)
//         let gasPrice = await serializeBigInt(msg.GasPrice)
//         let gasLimit = await serializeBigInt(msg.GasLimit)
//         let method = dagCBOR.util.serialize(msg.Method)
//         let params = await serializeParams(msg.Params)

//         buf = Buffer.concat([buf, to, from, nonce, value, gasPrice, gasLimit, method, params])
//         let cid = await getCIDByBuf(buf)
//         resolve(cid)
//     })
// }

const getMessageCID = async (msg) => {
    return new Promise(async (resolve, reject) => {
        let buf = Buffer.from([138])

        let version = dagCBOR.util.serialize(msg.Version);
        let to = await serializeAddress(msg.To)
        let from = await serializeAddress(msg.From)
        let nonce = dagCBOR.util.serialize(msg.Nonce)
        let value = await serializeBigInt(msg.Value)
        let gasLimit = dagCBOR.util.serialize(msg.GasLimit)
        let gasFeeCap = await serializeBigInt(msg.GasFeeCap)
        let gasPremium = await serializeBigInt(msg.GasPremium)
        let method = dagCBOR.util.serialize(msg.Method)
        let params = await serializeParams(msg.Params)

        buf = Buffer.concat([buf, version, to, from, nonce, value, gasLimit, gasFeeCap, gasPremium, method, params])
        let cid = await getCIDByBuf(buf)
        resolve(cid)
    })
}




 const privateKeyToAddress = (privateKey) => {
    return new Promise((resolve, reject) => {
        try {
            let network = 'f'
            let protocol = 1
            let private1 = multibase.decode('f' + privateKey)
            console.log("11111")

            let key = ec.keyFromPrivate(private1)
            let pub = key.getPublic().encode('hex')
            let pubKey = multibase.decode("f" + pub)
            let hash = blakejs.blake2b(pubKey, null, 20)
            console.log("22222")
            let checkSum = blakejs.blake2b(Buffer.concat([Buffer.from([protocol]), Buffer.from(hash)]), null, 4)
            console.log("222555")
            let base32Address = multibase.encode('b', Buffer.concat([Buffer.from(hash), Buffer.from(checkSum)])).toString()
            console.log("3333")

            let address = network + protocol + base32Address.substring(1)
            resolve(address)
        } catch (error) {
            reject(error)
        }
    })
}

const signMessage = (message, privateKey) => {
    return new Promise(async (resolve, reject) => {
        try {
            let private1 = multibase.decode('f' + privateKey)
            let cid = await getMessageCID(message)
            let msghash = blakejs.blake2b(cid.buffer, null, 32)
            const sigObj = secp256k1.ecdsaSign(msghash, private1)
            let sig = Buffer.concat([Buffer.from(sigObj.signature), Buffer.from([sigObj.recid])])
            let sigBase64 = multibase.encode('M', sig).toString()
            let data = sigBase64.substring(1, sigBase64.length)

            let signedMsg = {
                Message: message,
                Signature: {
                    Type: 1,
                    Data: data
                }
            }
            resolve(signedMsg)
        } catch (error) {
            reject(error)
        }
    })
}



exports.getBalance = getBalance
exports.getNounce = getNounce
exports.privateKeyToAddress = privateKeyToAddress
exports.signMessage = signMessage
exports.mpoolPush = mpoolPush
exports.waitMsg = waitMsg
exports.getGasEstimateFeeCap = getGasEstimateFeeCap
exports.getGasEstimateGasPremium = getGasEstimateGasPremium
exports.getGasEstimateGasLimit = getGasEstimateGasLimit
exports.getGasEstimateMessageGas = getGasEstimateMessageGas
