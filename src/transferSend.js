const keythereum = require("keythereum");
const bool = require("./bool")
const {CreateApi} = require('bool-network-js');
const { WsProvider,HttpProvider } = require('@polkadot/rpc-provider');
const { Keyring, decodeAddress } = require('@polkadot/keyring');
const { stringToU8a, u8aToHex } = require('@polkadot/util');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const multibase = require('multibase');

//变量定义
const boolRpcUrl = "wss://rpc-bool.bool.network";
const filRpcUrl = "http://test-rpc-fil.buer.network:789/rpc/v0";
const filSdk = require("./filecoin");
var signMessage = {
    sign:"0",
}

//通过密码从keystore获取私钥
function getPrivateKey(password,keyStore) {
    return new Promise((resolve, reject) => {
        let privateKey = keythereum.recover(password,keyStore).toString('hex');
        resolve(privateKey);
    });
}

//进行签名
function startSign(password,keyStore,type,rpcUrl,amount,to){
    signMessage.sign = "0"
    // console.log(password,keyStore,type,rpcUrl,amount,to)
    
    getPrivateKey(password,keyStore).then(seed=>{
        let privateKey = bool.getKey(seed,type);
        switch(type){
            case "BTC":
                 break;
            case "ETH":
                 break;
            case "BOOL":
                 boolSign(rpcUrl,privateKey,amount,to).then(sign=>{
                    console.log("签名信息\n")
                    signMessage.sign = sign
                    console.log(sign)
                 })
                 break;
            case "FIL":
                filCoinTransfer(to,amount,privateKey,rpcUrl);
                 break;
            case "PAD":
                 break;
        }
       
    })

}
//获取签名
function getSign(){
    return JSON.stringify(signMessage) 
}
//btc币交易签名

//fil币交易签名
 async function filCoinTransfer(to, value, privateKey,url){
    console.log("进入filCoinTransfer方法")
    console.log(to,value,privateKey,url)
    let from =  await filSdk.privateKeyToAddress(privateKey)
    console.log("打印 from"+from)
    let nonce =  await filSdk.getNounce(from, url)
    if(nonce == null){
        nonce = 0
        console.log("nonce未定义")
    }
    console.log("打印 nonce\n"+nonce)
    let params = "b82e54acf0a431447a0060d1571c77cdeb919114a4b5361040bd02bed141fd3b"
    params = multibase.decode('f' + params)
    params = multibase.encode("base64pad", params).toString().substring(1)
    console.log("params------------ "+params)
   let gasEstimateMessageGas = await filSdk.getGasEstimateMessageGas(from,to,url).then(res=>{
       console.log(res.data)
       return res.data.result
   })
   let gasLimit = gasEstimateMessageGas.GasLimit
   let gasPremium = gasEstimateMessageGas.GasPremium
   let gasFeeCap = gasEstimateMessageGas.GasFeeCap
    let message = {
           "Version": 0,
            "To": to,
            "From": from,
            "Nonce": nonce,
            "Value": value.toString(),
            "GasPremium":gasPremium,
            "GasFeeCap":gasFeeCap,
            "GasLimit": parseInt(gasLimit*1.2),
            "Method": 0,
            "Params": params
    }
    console.log("message"+JSON.stringify(message))
    let signedMsg = await filSdk.signMessage(message, privateKey)
    signMessage.sign = JSON.stringify(signedMsg)
    console.log("signedMsg------"+JSON.stringify(signedMsg))
   

}


//bool币交易签名
function boolSign(boolRpcUrl,privateKey,amount,to) {
    return new Promise(async (resolve,reject)=>{
        try {
            let privateKeyBuffer;
            if(privateKey.substring(0,2) === '0x') {
                privateKeyBuffer = privateKey.substring(2);
            }else {
                privateKeyBuffer = privateKey;
            }
            const privateBuf = Buffer.from(privateKeyBuffer, 'hex');
            await cryptoWaitReady();
            const keyring = new Keyring({ type: 'sr25519' });
            const alice = keyring.addFromSeed(privateBuf);
            const from = keyring.getPair(alice.address);
            console.log("from----------",from.address);
            console.log("to--------",to)
            let api = await getWorkApi(boolRpcUrl);

            let call = api.tx.balances.transfer(to, amount);
            // let nonce = await api.query.system.accountNonce(alice.address);
            let { nonce: accountNonce} = await api.query.system.account(alice.address)
            let data = call.sign(from,
                {nonce: accountNonce}
            );
            resolve(
                data.toHex()
            );
        } catch (error) {
            console.log(error);
            Toast(error);
        }
    })
}
//booll链获取api
const getWorkApi = async (rpcUrl) => {
      return await CreateApi(new WsProvider(rpcUrl));
    }


exports.startSign = startSign
exports.getSign = getSign

//-->test

// const keyStore = {
//     address: "c2245f1b62bc1869a8c8957ea16c6addbb5886e2",
//     crypto: {
//         cipher: "aes-128-ctr",
//         cipherparams: {
//             iv: "8e9313a0d8f72053a6de47521fad154d"
//         },
//         ciphertext: "7f7a89d74e21719feb4be2ab530a5153",
//         kdf: "scrypt",
//         kdfparams: {
//             dklen: 32,
//             n: 4096,
//             p: 1,
//             r: 8,
//             salt: "43a8eaba3d7723bf37c683c8fb4edd0e079450ecee6faa78b5ba63232a93cb84"
//         },
//         mac: "935663f3f2b8999030838ef6f53ffda905abcd6f766acc96161d97cbe51bec14"
//     },
//     id: "3499ded0-8054-4616-8be9-cae37555f3cf",
//     version: 3
// }
// startSign("123456",keyStore,"FIL",filRpcUrl,"1","f1khuckgpkjrlfmlkfgkz2dyc2au7rqmd75w7jazy")
