const Web3 = require("web3");
const SHA256 = require("crypto-js/sha256");

const web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return new Web3("http://127.0.0.1:8545"); // AJ-TODO - GET FROM ENV
};
// value = "" + value + timestamp
const generateTransactionHash = (value, timestamp) => {
	return SHA256("" + value + timestamp).toString();
};

const recoverAccountAddress = async ({ value, timestamp, signature }) => {
	// hashed message before signing
	const messageHash = generateTransactionHash(value, timestamp);
	const recoveredAddress = await getWeb3Instance().eth.accounts.recover(
		messageHash,
		signature
	);
	return recoveredAddress;
};
const isValidTransaction = async (tx) => {
	const recoveredAddress = await recoverAccountAddress(tx);
	return recoveredAddress === tx.address;
};
module.exports = {
	getWeb3Instance,
	isValidTransaction,
};
