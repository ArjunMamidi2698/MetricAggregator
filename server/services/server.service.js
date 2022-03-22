const { generateTransactionHash } = require("../../helper");
const { recoverAccountAddress } = require("../../web3Utils");

const getRecoveredAccountAddress = async ({ value, timestamp, signature }) => {
	try {
		if (!signature) throw new Error("Signature is required");
		// hashed message before signing
		const messageHash = generateTransactionHash(value, timestamp);
		const recoveredAddress = await recoverAccountAddress(
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
		const recoveredAddress = await getRecoveredAccountAddress(tx);
		return recoveredAddress === tx.address;
	} catch (error) {
		return false;
	}
};
module.exports = {
	isValidTransaction,
	getRecoveredAccountAddress,
};
