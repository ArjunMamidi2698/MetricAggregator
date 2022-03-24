const Web3 = require("web3");

let web3 = null; // cache
/**
 * Returns an instance of Web3 class.
 * If not found from cache, creates a new instance and assign to the cached variable
 * and return the instance else returns the already created and stored instance.
 * Instance is created for the configured providerUrl.
 * If "http://127.0.0.1:8545" is using as provider, then ganache(npm run ganache) should be run before starting the server/client.
 *
 * @returns {Web3}
 *
 **/
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return (web3 = new Web3(
		process.env.PROVIDER_URL || "http://127.0.0.1:8545"
	));
};

/**
 * Takes account and messageHash as params and sign the message for the account and generates a signature.
 * Returns generated signature.
 *
 * @param {object} account
 * @param {string} msgHash
 *
 * @returns {string} signature
 *
 **/
const signMessage = async (account, msgHash) => {
	const { signature } = await account.sign(msgHash);
	return signature;
};

/**
 * Takes mesasage and signature as params and recovers the account address who signed the message.
 * Returns recovered account address or throws error if any.
 *
 * @param {string} message
 * @param {string} sigature
 *
 * @returns {string} address
 *
 **/
const recoverAccountAddress = async (message, signature) => {
	try {
		if (!signature) throw new Error("Signature is required");
		const recoveredAddress = await getWeb3Instance().eth.accounts.recover(
			message,
			signature
		);
		return recoveredAddress;
	} catch (error) {
		throw new Error(error.message);
	}
};

// Accounts
/**
 * Returns found account in the wallet searched by index or the address in wallet.
 * Returns undefined if account not found with given param
 *
 * @param {string | number} accountKey
 *
 * @returns {object} accoount
 *
 **/
const findAccount = (accountKey) => getWeb3Instance().eth.accounts.wallet[accountKey];

/**
 * Returns length of account in wallet
 *
 * @returns {number}
 *
 **/
const getAccountsLengthInWallet = () => getWeb3Instance().eth.accounts.wallet.length;

/**
 * Creates given number of accounts in wallet
 *
 * @param {number} accountsLength
 * 
 **/
const createAccounts = (accountsLength) => getWeb3Instance().eth.accounts.wallet.create(accountsLength);

/**
 * Adds a random account into the wallet and returns the added Account object.
 *
 * @returns {object}
 * 
 **/
const addAccountToWallet = () => {
	const web3 = getWeb3Instance();
	return web3.eth.accounts.wallet.add(web3.utils.randomHex(32));
};

/**
 * Clears all accounts in a wallet.
 *
 **/
const clearAccounts = () => getWeb3Instance().eth.accounts.wallet.clear();

module.exports = {
	getWeb3Instance,
	signMessage, recoverAccountAddress,
	findAccount, getAccountsLengthInWallet, createAccounts, addAccountToWallet, clearAccounts
};
