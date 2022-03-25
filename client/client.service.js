const axios = require("axios");
const {
	addLog,
	validateConfiguredRange,
	generateRandomValueInRange,
	validateValue,
	generateTransactionHash,
} = require("../utils/serviceUtils");
const {
	signMessage,
	findAccount,
	createAccounts,
} = require("../utils/web3Utils");
require("dotenv").config({ path: "../.env" }); // read properties from .env
let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);
let server = null;

/**
 * Will do a post request to server and pass transaction object as data.
 * Transaction Object and tamper are taken as params.
 * if tamper is set as true, then signature from txObj will be modified/tampered and post to server.
 *
 * @param {object} txObj
 * @param {boolean} tamper
 *
 **/
const postTransactionToServer = async (txObj, tamper) => {
	try {
		// intentionally fail some transactions
		if (tamper) {
			console.log(
				"intentionally failing this to verify aggregate functionality"
			);
			txObj.signature = txObj.signature.substring(2);
		}
		if (process.env.ENV_VAR == "integrationTest") {
			await chai.request(server).post("/sendMessage").send(txObj);
		} else {
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
		}
	} catch (error) {
		console.error("something went wrong", err);
	}
	return;
};

/**
 * Generates a Transaction object which contains timestamp, address( account who creating the message ), value, signature.
 * Takes account( valid account created in eth wallet ) and value( valid positive number ) as params.
 * Generates a hash for the message with timestamp using crypto-js/SHA256
 * Generated the signature with the hash message and return the transaction object with all the attributes.
 *
 * @param {object} account
 * @param {number} value
 *
 * @returns {object} transactionObject
 *
 **/
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

/**
 * This method will take accountKey, value and tamper as params.
 * Will validate "accountKey" and throw error if any and used to find account with the key from the Etherium wallet.
 * Will validate "value" and throw error if any and used to generate the txObj
 * "tamper" param is used to intentionally fail some messages to verify aggregate logic in server.
 * Will generate a txObj if all values are validated and post the generated txObj to server.
 * Returns the posted txObj or errorObj if any.
 *
 * @param {number | string} accountKey
 * @param {number} value
 * @param {boolean} tamper
 *
 * @returns {object} txObj or errorObj
 *
 **/
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

let accountsLength = 0; // cache
let accounts = []; // cache
/**
 *
 * Returns the stored accounts list
 *
 * @returns {Array}
 *
 **/
const getAccounts = () => accounts;
/**
 *
 * Takes count as param and Creates accounts in Etherium wallet.
 * Also will store created accounts in array.
 *
 * @param {number} count
 *
 **/
const initAccounts = (count) => {
	accountsLength = count;
	addLog(`Creating ${accountsLength} accounts in wallet......`);
	createAccounts(accountsLength);
	addLog(`${accountsLength} Accounts CREATED`);

	// save to cached array
	accounts = []; // reset
	for (let index = 0; index < accountsLength; index++) {
		accounts.push(findAccount(index));
	}
};

/**
 *
 * This will starts the polling for 1 minute with configured interval.
 * Will add message and post them to server for every publish interval.
 * Account and value would be taken as random in configured range.
 *
 **/
const initClientToServerMessagesPolling = () => {
	// polling
	const [minValue, maxValue] = validateConfiguredRange(
		process.env.MESSAGE_VALUE_RANGE_MIN || 1,
		process.env.MESSAGE_VALUE_RANGE_MAX || 10
	);
	console.log("Starting Polling...");
	const pollingTimeout =
		process.env.ENV_VAR == "integrationTest" ? 6000 : 60000;
	if(process.env.ENV_VAR == "integrationTest") {
		server = require("../server/server");
	}
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
	}, pollingTimeout); // stop polling after 1 minute or 6 seconds in test env
};

module.exports = {
	postTransactionToServer,
	generateTransactionObject,
	addMessage,
	getAccounts,
	initAccounts,
	initClientToServerMessagesPolling,
};
