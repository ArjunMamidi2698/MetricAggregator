const Web3 = require("web3");
const SHA256 = require("crypto-js/sha256");
const axios = require("axios");
const { addLog } = require("../helper");

let web3 = null; // cache
const getWeb3Instance = () => {
	if (web3 != null) return web3;
	return (web3 = new Web3(
		process.env.PROVIDER_URL || "http://127.0.0.1:8545"
	));
};

// value = "" + value + timestamp
const generateTransactionHash = (value, timestamp) => {
	return SHA256("" + value + timestamp).toString();
};

const signMessage = async (account, txHash) => {
	const { signature } = await account.sign(txHash);
	return signature;
};

const generateTransactionObject = async (account, value) => {
	const timestamp = Date.now();
	const signature = await signMessage(
		account,
		generateTransactionHash(value, timestamp)
	);
	const txObj = {
		timestamp,
		address: account.address,
		value,
		signature,
	};
	return txObj;
};

const postTransactionToServer = async (account, value) => {
	try {
		const txObj = await generateTransactionObject(account, value);
		// intentionally fail some transactions
		if (txObj.value == 5 || txObj.value == 10) {
			console.log(
				"intentionally failing this to verify aggregate functionality"
			);
			txObj.value = 7;
		}
		axios
			.post(
				`http://localhost:${process.env.SERVER_PORT}/sendMessage`,
				txObj
			)
			.then(function serverResponse(res) {
				if (res.status == 200) {
					const { address, value } = txObj;
					addLog(
						`Sent value:"\x1b[33m${value}\x1b[0m" from AccountAddress: ${address} to server`
					);
				}
			});
	} catch (error) {
		console.error("something went wrong", err);
	}
	return;
};

let accountsLength = process.env.ACCOUNTS_LENGTH || 10; // cache
let accounts = []; // cache
const initAccounts = () => {
	const web3 = getWeb3Instance();
	addLog(`Creating ${accountsLength} accounts in wallet......`);
	web3.eth.accounts.wallet.create(accountsLength);
	addLog(`${accountsLength} Accounts CREATED`);

	// save to cached array
	accounts = []; // reset
	for (let index = 0; index < accountsLength; index++) {
		accounts.push(web3.eth.accounts.wallet[index]);
	}
};
const initClientToServerMessagesPolling = () => {
	initAccounts();

	// polling
	const web3 = getWeb3Instance();
	const minValue = process.env.MESSAGE_VALUE_RANGE_MIN || 1;
	const maxValue = process.env.MESSAGE_VALUE_RANGE_MAX || 10;
	if (isNaN(minValue) || isNaN(maxValue)) {
		throw new Error("Invalid input provided");
	}
	if (minValue > maxValue) {
		throw new Error("minValue should not be greater than maxValue");
	}
	const interval = setInterval(() => {
		console.log(maxValue, minValue);
		postTransactionToServer(
			web3.eth.accounts.wallet[
				Math.floor(Math.random() * accountsLength)
			],
			Math.floor(
				Math.random() * (parseInt(maxValue) - parseInt(minValue) + 1)
			) + parseInt(minValue)
		);
	}, process.env.MESSAGE_PUBLISH_INTERVAL || 1000);
	setTimeout(() => {
		clearInterval(interval);
	}, 30000);
};

module.exports = {
	getWeb3Instance,
	postTransactionToServer,
	initClientToServerMessagesPolling,
};
