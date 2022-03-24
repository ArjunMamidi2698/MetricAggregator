const assert = require("assert");
const { generateTransactionObject } = require("../client/client.service");
const { MetricAggregator } = require("../server/aggregator");
const {
	getMetricAggregateInstance,
	getMessages,
	getAggregratedValue,
} = require("../server/services/aggregator.service");
const { findAccount, createAccounts } = require("../utils/web3Utils");

describe("Aggregrate Message", () => {
	describe("MetricAggregator class", () => {
		it("should get default instance", () => {
			const defaultAggregateInstance = getMetricAggregateInstance();
			assert.equal(defaultAggregateInstance.aggregatedValue, 0);
			assert.equal(
				defaultAggregateInstance.messagesFromClients.length,
				0
			);
		});
		it("should create instance with correct parameters", async () => {
			createAccounts(5);
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			const metricAggregatorInstance = new MetricAggregator(value, [
				{
					address: txObj.address,
					value: txObj.value,
					isValid: true,
				},
			]);
			assert.equal(metricAggregatorInstance.aggregatedValue, value);
			assert.equal(
				metricAggregatorInstance.messagesFromClients.length,
				1
			);
			assert.deepEqual(
				metricAggregatorInstance.messagesFromClients[0],
				metricAggregatorInstance.formatMessage(txObj, true)
			);
		});
	});
	describe("Add Message", () => {
		it("Should add Correct message object to the list in instance", async () => {
			const aggregateInstance = getMetricAggregateInstance();
			assert.equal(aggregateInstance.aggregatedValue, 0);
			assert.equal(aggregateInstance.messagesFromClients.length, 0);
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			await aggregateInstance.addMessage(txObj);
			assert.equal(aggregateInstance.aggregatedValue, value);
			assert.equal(aggregateInstance.messagesFromClients.length, 1);
			assert.deepEqual(
				aggregateInstance.messagesFromClients[0],
				aggregateInstance.formatMessage(txObj, true)
			);
			const txObj2 = await generateTransactionObject(account, value);
			await aggregateInstance.addMessage(txObj2);
			assert.equal(aggregateInstance.aggregatedValue, value + value);
			assert.equal(aggregateInstance.messagesFromClients.length, 2);
			assert.deepEqual(
				aggregateInstance.messagesFromClients[1],
				aggregateInstance.formatMessage(txObj2, true)
			);
		});
		it("Should add failed status in message object for tampered messageObject", async () => {
			const aggregateInstance = new MetricAggregator(0, []);
			assert.equal(aggregateInstance.aggregatedValue, 0);
			assert.equal(aggregateInstance.messagesFromClients.length, 0);
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			txObj.value += 1; // tampering value
			await aggregateInstance.addMessage(txObj);
			assert.equal(aggregateInstance.messagesFromClients.length, 1);
			assert.equal(
				aggregateInstance.messagesFromClients[0].isValid,
				false
			);
		});
	});
	describe("Aggregated Value, Success and Fail with StaleTimeout", () => {
		it("Should aggregrate properly for submitted values", async () => {
			const aggregateInstance = new MetricAggregator(0, []);
			assert.equal(aggregateInstance.aggregatedValue, 0);
			assert.equal(aggregateInstance.messagesFromClients.length, 0);
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			const txObj2 = await generateTransactionObject(account, value);
			const txObj3 = await generateTransactionObject(account, value);
			const txObj4 = await generateTransactionObject(account, value);
			await aggregateInstance.addMessage(txObj);
			await aggregateInstance.addMessage(txObj2);
			await aggregateInstance.addMessage(txObj3);
			await aggregateInstance.addMessage(txObj4);
			assert.equal(aggregateInstance.messagesFromClients.length, 4);
			assert.equal(aggregateInstance.aggregatedValue, 400);
		});
		it("Should Wait for stale timeout and remove that value from aggregated value", async () => {
			const aggregateInstance = new MetricAggregator(0, []);
			assert.equal(aggregateInstance.aggregatedValue, 0);
			assert.equal(aggregateInstance.messagesFromClients.length, 0);
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			const tamperedValue = 101;
			txObj.value = tamperedValue; // tampering value
			await aggregateInstance.addMessage(txObj);
			assert.equal(aggregateInstance.messagesFromClients.length, 1);
			assert.equal(aggregateInstance.aggregatedValue, tamperedValue);
			const staleTimeout =
				process.env.INVALID_VALUE_STALE_TIMEOUT || 5000;
			setTimeout(() => {
				assert.equal(aggregateInstance.aggregatedValue, tamperedValue);
			}, staleTimeout - 100); // still tampered value before timeout
			setTimeout(() => {
				assert.notEqual(
					aggregateInstance.aggregatedValue,
					tamperedValue
				);
				assert.equal(aggregateInstance.aggregatedValue, 0);
			}, staleTimeout);
			console.log();
		});
	});
	describe("getters with filters", () => {
		it("get correct Aggregated value for Success messages", async () => {
			const aggregateInstance = getMetricAggregateInstance();
			getMetricAggregateInstance().reset();
			const account = findAccount(0);
			const value = 100;
			const txObj = await generateTransactionObject(account, value);
			const txObj2 = await generateTransactionObject(account, value);
			const txObj3 = await generateTransactionObject(account, value);
			const txObj4 = await generateTransactionObject(account, value);
			txObj2.value += 1;
			await aggregateInstance.addMessage(txObj);
			await aggregateInstance.addMessage(txObj2);
			await aggregateInstance.addMessage(txObj3);
			await aggregateInstance.addMessage(txObj4);
			assert.notEqual(getAggregratedValue("success"), 401);
			assert.equal(getAggregratedValue("success"), 300);
		});
		it("get correct Aggregated value for fail messages", async () => {
			assert.notEqual(getAggregratedValue("fail"), 0);
			assert.equal(getAggregratedValue("fail"), 101);
		});
		it("get correct Aggregated object with both success and fail messages", async () => {
			assert.deepEqual(getAggregratedValue(), {
				aggregatedValue: 401, // will remove failed valie after stale timeout 
				success: 300,
				fail: 101,
			});
		});
		it("get correct Messages length for success filter", async () => {
			assert.equal(getMessages("success").length, 3);
		});
		it("get correct Messages length for fail filter", async () => {
			assert.equal(getMessages("fail").length, 1);
		});
		it("get correct Messages length without any filter", async () => {
			assert.equal(getMessages().length, 4);
		});
	});
});
