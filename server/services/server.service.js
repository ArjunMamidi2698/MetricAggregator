const Web3 = require("web3");
const SHA256 = require("crypto-js/sha256");

const web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return new Web3(process.env.PROVIDER_URL || "http://127.0.0.1:8545");
};
// value = "" + value + timestamp
const generateTransactionHash = (value, timestamp) => {
	return SHA256("" + value + timestamp).toString();
};

const recoverAccountAddress = async ({ value, timestamp, signature }) => {
	try {
		// hashed message before signing
		const messageHash = generateTransactionHash(value, timestamp);
		const recoveredAddress = await getWeb3Instance().eth.accounts.recover(
			messageHash,
			signature
		);
		return recoveredAddress;
	} catch (error) {
		throw new Error(error.message);
	}
};
const isValidTransaction = async (tx) => {
	try {
        // AJ - TODO - ALSO CHECK ADDRESS IS FROM CURRENT WALLET
		const recoveredAddress = await recoverAccountAddress(tx);
		return recoveredAddress === tx.address;
	} catch (error) {
		return false;
	}
};
module.exports = {
	getWeb3Instance,
	isValidTransaction,
};
