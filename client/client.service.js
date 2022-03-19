const Web3 = require("web3");
const SHA256 = require("crypto-js/sha256");
const axios = require("axios");
const web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return new Web3("http://127.0.0.1:8545"); // AJ - TODO - GET FROM ENV
};

// value = "" + value + timestamp
const generateTransactionHash = (value, timestamp) => {
	return SHA256("" + value + timestamp).toString();
};

const signMessage = async (txHash, account) => {
	const signature = await getWeb3Instance().eth.sign(txHash, account); // internally it will take the private key to sign
	return signature;
};

const generateTransactionObject = async (account, value) => {
	const timestamp = Date.now();
	const signature = await signMessage(
		generateTransactionHash(value, timestamp),
		account
	);
	const txObj = {
		timestamp,
		address: account,
		value,
		signature,
	};
	return txObj;
};

const postTransactionToServer = async (account, value) => {
	const txObj = await generateTransactionObject(account, value);
	axios.post(
		`http://localhost:${process.env.SERVER_PORT}/sendMessage`,
		txObj
	);
};
module.exports = {
	getWeb3Instance,
	postTransactionToServer,
};
