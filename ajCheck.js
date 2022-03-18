const Web3 = require("web3");
const ganache = require("ganache");

const web3 = new Web3(ganache.provider());


// // web3.eth.getAccounts(console.log);
// const accounts = web3.eth.getAccounts().then(res => res);
// console.log(accounts);
// // console.log( web3 );
// web3.eth.getBalance("0xe0626842C0F70A2149fe9978223062d28Af86814").then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });

web3.eth.getAccounts((err, accounts) => {
    console.log( accounts );
    web3.eth.getBalance(accounts[0]).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
})