const bool = require("./bool")
const sign = require("./transferSend")
const boolRpcUrl = "wss://rpc-bool.bool.network"
const keyStore = {
    address: "c2245f1b62bc1869a8c8957ea16c6addbb5886e2",
    crypto: {
        cipher: "aes-128-ctr",
        cipherparams: {
            iv: "8e9313a0d8f72053a6de47521fad154d"
        },
        ciphertext: "7f7a89d74e21719feb4be2ab530a5153",
        kdf: "scrypt",
        kdfparams: {
            dklen: 32,
            n: 4096,
            p: 1,
            r: 8,
            salt: "43a8eaba3d7723bf37c683c8fb4edd0e079450ecee6faa78b5ba63232a93cb84"
        },
        mac: "935663f3f2b8999030838ef6f53ffda905abcd6f766acc96161d97cbe51bec14"
    },
    id: "3499ded0-8054-4616-8be9-cae37555f3cf",
    version: 3
}

var myBoolAccount={}

const getMnemonic=()=>bool.getMnemonic()

function generateBoolAccount(name,passwd,mnemonic){
    console.log("参数---")
    console.log(name)
    console.log(passwd)
    console.log(mnemonic)
    bool.createAccount(name,passwd,mnemonic).then(account=>{
        console.log(account)
        myBoolAccount = account
    })
}

function getBoolAccount(){
    return JSON.stringify(myBoolAccount)
}

function startSign(data){
    console.log("122--------------")

    console.log(JSON.stringify(data))
    console.log(data.passwd)
    // data= '{"passwd": "123456","keyStore":$keyStore,"type": "BOOL","rpcUrl":"wss://rpc-bool.bool.network","amout":"1","to":"5Hb8RrtAKRNeHVzsdKHth6hHXELrrfJU3gWRqCaaGtxersR2"}';
    sign.startSign(data.passwd,data.keyStore,data.type,data.rpcUrl,data.amout,data.to)
}

const getSign = ()=>sign.getSign()

window.wallet = {
    getMnemonic,
    generateBoolAccount,
    getBoolAccount,
    startSign,
    getSign
}

//to test 
// startSign("123456",keyStore,"BOOL",boolRpcUrl,"1","5Hb8RrtAKRNeHVzsdKHth6hHXELrrfJU3gWRqCaaGtxersR2")
// console.log(getSign())
// generateBoolAccount("fan","123456",getMnemonic())

