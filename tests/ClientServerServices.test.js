const assert = require("assert");
const { generateTransactionObject } = require("../client/client.service");
const { generateTransactionHash } = require("../helper");
const {
	getRecoveredAccountAddress,
	isValidTransaction,
} = require("../server/services/server.service");
const {
	getWeb3Instance,
	findAccount,
	createAccounts,
	addAccountToWallet,
	getAccountsLengthInWallet,
} = require("../web3Utils");
require("dotenv").config({ path: "./.env" }); // read properties from .env

let web3 = getWeb3Instance();

describe("Accounts in Etherium Wallet", () => {
	it("should create 5 accounts in wallet", () => {
		createAccounts(5);
		assert.equal(getAccountsLengthInWallet(), 5);
	});
	it("should find account in wallet by id", () => {
		const prevAccountsLength = getAccountsLengthInWallet();
		const { index, address: newAddress } = addAccountToWallet(web3);
		assert.equal(getAccountsLengthInWallet(), prevAccountsLength + 1);
		const { address } = findAccount(index);
		assert.equal(newAddress, address);
	});
	it("should find account in wallet by address", () => {
		const prevAccountsLength = getAccountsLengthInWallet();
		const { address: newAddress } = addAccountToWallet(web3);
		assert.equal(getAccountsLengthInWallet(), prevAccountsLength + 1);
		const { address } = findAccount(newAddress);
		assert.equal(newAddress, address);
	});
});

describe("Message object", () => {
	it("should generate correct message object", async () => {
		const account = findAccount(0);
		const value = 100;
		const txObj = await generateTransactionObject(account, value);
		assert.equal(value, txObj.value);
		assert.equal(account.address, txObj.address);
		const { signature } = account.sign(
			generateTransactionHash(value, txObj.timestamp)
		);
		assert.equal(signature, txObj.signature);
	});
	it("should verify signature in message object", async () => {
		const account = findAccount(0);
		const value = 100;
		const txObj = await generateTransactionObject(account, value);
		const valid = await isValidTransaction(txObj);
		assert.equal(valid, true);
	});
	it("should recover correct account address from message object", async () => {
		const account = findAccount(0);
		const value = 100;
		const txObj = await generateTransactionObject(account, value);
		const recoveredAddress = await getRecoveredAccountAddress(txObj);
		assert.equal(txObj.address, recoveredAddress);
	});
	it("should fail validating signature of tampered message object", async () => {
		const account = findAccount(0);
		const value = 100;
		const txObj = await generateTransactionObject(account, value);
		let valid = await isValidTransaction(txObj);
		assert.equal(valid, true);
		txObj.value += 1; // tampering value
		valid = await isValidTransaction(txObj);
		assert.equal(valid, false);
	});
});
