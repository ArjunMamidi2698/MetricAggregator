const axios = require("axios");
const {
	addLog,
	validateConfiguredRange,
	generateRandomValueInRange,
	validateValue,
	generateTransactionHash,
} = require("../helper");
const { signMessage, findAccount, createAccounts } = require("../web3Utils");

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

const postTransactionToServer = async (txObj, tamper) => {
	try {
		// intentionally fail some transactions
		if (tamper) {
			console.log(
				"intentionally failing this to verify aggregate functionality"
			);
			txObj.signature = txObj.signature.substring(2);
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

const addMessage = async (accountKey, value, tamper) => {
	try {
		let account = findAccount(accountKey);
		if (account == undefined)
			throw new Error("Account not found with provided address or index");
		value = validateValue(value);
		const txObj = await generateTransactionObject(account, value);
		postTransactionToServer(txObj, tamper);
		return txObj;
	} catch (error) {
		return { error: error.message };
	}
};

let accountsLength = process.env.ACCOUNTS_LENGTH || 10; // cache
let accounts = []; // cache
const getAccounts = () => accounts;
const initAccounts = () => {
	addLog(`Creating ${accountsLength} accounts in wallet......`);
	createAccounts(accountsLength);
	addLog(`${accountsLength} Accounts CREATED`);

	// save to cached array
	accounts = []; // reset
	for (let index = 0; index < accountsLength; index++) {
		accounts.push(findAccount(index));
	}
};
const initClientToServerMessagesPolling = () => {
	initAccounts();

	// polling
	const [minValue, maxValue] = validateConfiguredRange(
		process.env.MESSAGE_VALUE_RANGE_MIN || 1,
		process.env.MESSAGE_VALUE_RANGE_MAX || 10
	);
	console.log("Starting Polling...");
	const interval = setInterval(() => {
		const value = generateRandomValueInRange(minValue, maxValue);
		addMessage(
			generateRandomValueInRange(0, accountsLength - 1),
			value,
			value == minValue || value == maxValue
		);
	}, process.env.MESSAGE_PUBLISH_INTERVAL || 1000);
	setTimeout(() => {
		console.log("Stopping Polling...");
		clearInterval(interval);
	}, 60000); // stop polling after 1 minute
};

module.exports = {
	postTransactionToServer,
	initClientToServerMessagesPolling,
	getAccounts,
	addMessage,
	generateTransactionObject,
};
