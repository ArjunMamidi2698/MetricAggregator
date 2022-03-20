const Web3 = require("web3");

const { generateTransactionHash } = require("../../helper");

const web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return new Web3(process.env.PROVIDER_URL || "http://127.0.0.1:8545");
};

const recoverAccountAddress = async ({ value, timestamp, signature }) => {
	try {
		if (!signature) throw new Error("Signature is required");
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
