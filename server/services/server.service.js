const { generateTransactionHash } = require("../../utils/serviceUtils");
const { recoverAccountAddress } = require("../../utils/web3Utils");

/**
 * Takes Message object from client as param and validates the signature.
 * Generates the message hash with timestamp from messageObject as that is used while signing the message in client side.
 * Will ask for recovered address from web3Utils.
 * Returns the recovered address or throws a new error if any.
 *
 * @param {object} messageObj
 *
 * @returns {string} recoveredAccountAddress
 *
 **/
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

/**
 * Takes Message object from client as param and validates the signature.
 * Will request recoveredAccount address and verifies if recovered address and signed address matches or not.
 * Returns the validation result. Returns false if any error.
 *
 * @param {object} messageObj
 *
 * @returns {boolean} isValid
 *
 **/
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
