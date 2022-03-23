const Web3 = require("web3");

let web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return (web3 = new Web3(
		process.env.PROVIDER_URL || "http://127.0.0.1:8545"
	));
};

// Sign
const signMessage = async (account, txHash) => {
	const { signature } = await account.sign(txHash);
	return signature;
};
// Verify/Recover
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
const findAccount = (accountKey) => getWeb3Instance().eth.accounts.wallet[accountKey];
const getAccountsLengthInWallet = () => getWeb3Instance().eth.accounts.wallet.length;
const createAccounts = (accountsLength) => getWeb3Instance().eth.accounts.wallet.create(accountsLength);
const addAccountToWallet = () => {
	const web3 = getWeb3Instance();
	return web3.eth.accounts.wallet.add(web3.utils.randomHex(32));
};
const clearAccounts = () => getWeb3Instance().eth.accounts.wallet.clear();

module.exports = {
	getWeb3Instance,
	signMessage, recoverAccountAddress,
	findAccount, getAccountsLengthInWallet, createAccounts, addAccountToWallet, clearAccounts
};
