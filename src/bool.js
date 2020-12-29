const  bip39 = require('bip39');
const bip32 = require('bip32');
const { hdkey } = require('ethereumjs-wallet');
const util = require('ethereumjs-util');
const bitcoin = require('bitcoinjs-lib');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const keythereum = require("keythereum");
const { u8aToHex } = require("@polkadot/util");
const filsdk = require("./filecoin");
const network = bitcoin.networks.testnet;
//bip39生成助记词
function getMnemonic(){
    return bip39.generateMnemonic();
}

//通过助记词生成种子
function getEntropyFromMnemonic(mnemonic){
    return bip39.mnemonicToEntropy(mnemonic);
}

//通过种子回复助记词
function getMnemonicFromEntropy(entropy){
    return bip39.entropyToMnemonic(entropy);

}

//通过种子来衍生出子私钥
//params:type--链类型
const getKey = function(seed,type) {
    console.log(typeof(seed))
    console.log("1")
    let hdWallet = hdkey.fromMasterSeed(seed);
    console.log("2")
    let bufferSeed = new Buffer.from(seed);
    console.log("3")
    var buffer = new Buffer(bufferSeed)
    console.log("4")
    let node = bip32.fromSeed(buffer);
    console.log("5")
    let pathKey;
    switch(type) {
        case "ETH":
            pathKey = hdWallet.derivePath("m/44'/60'/0'/0/0");//ETH币：60
            break;
        case "PAD":
            pathKey = hdWallet.derivePath("m/44'/3743'/0'/0/0");//PAD币：3743
            break;
        case "BOOL":
            pathKey = hdWallet.derivePath("m/44'/3744'/0'/0/0"); //bool币:3744
            break;
         case "FIL":
             pathKey = hdWallet.derivePath("m/44'/3745'/0'/0/0"); //file币:3745
             break; 
        case "BTC":
            console.log("6")
            pathKey = node.derivePath("m/44'/0'/0'/0/0"); //btc
            break;
    }
    
    if(type === "BTC") {
        console.log("7")
        console.log(typeof(pathKey))
        return pathKey;
    } else {
        console.log("8")
        console.log(pathKey._hdkey._privateKey.toString('hex'))
        return pathKey._hdkey._privateKey.toString('hex');
    }
}

const getAliceSeed = async function(privateKey) {
    // console.log("privateKey-----",privateKey)
    return new Promise(async (resolve,reject)=>{
        try {
            let privateKeyBuffer;
            // if(privateKey.substring(0,2) === '0x') {
            //     privateKeyBuffer = privateKey.substring(2);
            // }else {
            //     privateKeyBuffer = privateKey;
            // }
            privateKeyBuffer = privateKey;
            const privateBuf = Buffer.from(privateKeyBuffer, 'hex');
            await cryptoWaitReady();
            const keyring = new Keyring({ type: "sr25519" });
            const alice = keyring.addFromSeed(privateBuf);
            resolve(alice);
        } catch (error) {
            reject(error);
        }
    })
}


//通过私钥生成相应币种的地址
const generateAddress = async function(key,type) {
    let address;
    switch(type) {
        case "ETH":
            console.log("生成eth地址")
            address = "0x"+util.privateToAddress(Buffer.from(key,'hex'), true).toString('hex');//ETH币：60
            break;
        case "PAD":
            console.log("生成pad地址")
            address = "0x"+util.privateToAddress(Buffer.from(key,'hex'), true).toString('hex');//PAD币：3743
            break;
        case "BOOL":
            console.log("生成bool地址")
            address = await getAliceSeed(key); //bool币:3744
            break;
        case "FIL":
            console.log("生成fil地址")
            address = await filsdk.privateKeyToAddress(key);
            break;
        case "BTC":
            console.log("生成btc地址")
            console.log("network--------",network)
            console.log(key.publicKey)
            let p2pkh = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network : network });
            console.log("p2pkh--------",p2pkh.address)
            address = p2pkh.address;
            break;
    }
    return address;
}

// var aliceAddress = ""
// async function getAliceAddress(menmonic,type){
//     let key =  getKey(getEntropyFromMnemonic(menmonic),type)
//     return await getAliceSeed(key);
// }

// function getReallyAlice(){
//     return aliceAddress
// }


function getAddress(menmonic,type){
    console.log("menmonic-----",menmonic)
    console.log("type",type)
    let key =  getKey(getEntropyFromMnemonic(menmonic),type)
    console.log("9")
    console.log("123456789")
    let address = generateAddress(key,type)
    return address

}

const getKeyStore = function(pwd, seed) {
    return new Promise((resolve, reject) => {
        try {
            let params = { keyBytes: 32, ivBytes: 16 };
            let privateBuf = Buffer.from(seed, 'hex');
            let dk = keythereum.create(params);
            let options = {
                kdf: "scrypt",
                cipher: "aes-128-ctr",
                kdfparams: {
                    n: 4096,
                    r: 8,
                    p: 1,
                    dklen: 32
                }
            };
            let keyObject = keythereum.dump(pwd, privateBuf, dk.salt, dk.iv, options);
            resolve(keyObject);
        } catch (error) {
            reject(error);
        }

    });
}

async function createAccount(name,password,mnemonic) {
  let seed = getEntropyFromMnemonic(mnemonic)
  console.log("seed\n",seed)
  let BoolAccount = {};
  //生成keystore
  let keystore = await getKeyStore(password,seed);
  console.log("keystore"+JSON.stringify(keystore))
   //生成BTC地址
   BoolAccount.btcAccount = await generateAddress(getKey(seed,"BTC"),"BTC");
  //生成ETH地址
  BoolAccount.ethAccount = "0x"+await generateAddress(getKey(seed,"ETH"),"ETH");
  //生成PAD地址
  BoolAccount.padAccount = "0x"+await generateAddress(getKey(seed,"PAD"),"PAD");
  //生成BOOL地址
  let boolAddressAlice = await generateAddress(getKey(seed,"BOOL"),"BOOL");
  BoolAccount.boolAccount = boolAddressAlice.address;
  BoolAccount.boolPublicKey = u8aToHex(boolAddressAlice.publicKey);
  //todo
  //生成FIL地址
  // console.log("fil--- "+AccountModule.getKey(seed,"FIL"));
  BoolAccount.filAccount =  await generateAddress(getKey(seed,"FIL"),"FIL");

  //账户keystore，address，name: 跟钱包地址无关，地址只是账户标识
  BoolAccount.keystore = keystore;
  BoolAccount.address = "0x"+keystore.address;
  BoolAccount.name = name;
  return BoolAccount;


}

// createAccount("fan","123456",getMnemonic()).then(res=>console.log(res))

exports.getMnemonic = getMnemonic
exports.createAccount = createAccount
exports.getKey = getKey


