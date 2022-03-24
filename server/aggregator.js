const { addLog } = require("../helper");
const { isValidTransaction } = require("./services/server.service");
class MetricAggregator {
	/**
	 * Maintains AggregatedValue and Messages list from different client.
	 * Each Message will be validated( the signature ) and will be added to the list.
	 * Value from message will be aggregated at first and remove that after stale timeout.
	 *
	 * @param {number} aggregatedValue
	 * @param {Array} messagesFromClients
	 *
	 **/
	constructor(aggregatedValue = 0, messagesFromClients = []) {
		this.aggregatedValue = aggregatedValue;
		this.messagesFromClients = messagesFromClients;
	}

	/**
	 * Filter out valid messages from all messages from different clients
	 *
	 * @returns {Array}
	 *
	 **/
	getValidMessages() {
		return this.messagesFromClients.filter(
			(messageObj) => messageObj.isValid
		);
	}

	/**
	 * Filter out InValid messages from all messages from different clients
	 *
	 * @returns {Array}
	 *
	 **/
	getInvalidMessages() {
		return this.messagesFromClients.filter(
			(messageObj) => !messageObj.isValid
		);
	}

	/**
	 * Returns all messages received from different clients
	 *
	 * @returns {Array}
	 *
	 **/
	getAllMessages() {
		return this.messagesFromClients;
	}

	/**
	 * Takes filter as param and return appropriate list of messages based on filter
	 *
	 * @param {"success" | "fail"} filter
	 *
	 * @returns {Array}
	 *
	 **/
	getMessages(filter) {
		switch (filter) {
			case "success":
				return this.getValidMessages();
			case "fail":
				return this.getInvalidMessages();
			default:
				return this.getAllMessages();
		}
	}

	/**
	 * Takes filter as param and return sum of value from the appropriate list of messages based on filter
	 *
	 * @param {"success" | "fail"} filter
	 *
	 * @returns {number} sum
	 *
	 **/
	aggregate(filter) {
		return this.getMessages(filter)
			.map((message) => message.value)
			.reduce((partialSum, a) => partialSum + a, 0);
	}

	/**
	 * Takes filter as param and returns appropriate aggregated value.
	 * If no filter is applied, then return a object containing actual aggregatedValue( with invalid value if stale timeout is not yet finished)
	 * and aggregate("success") and aggregate("fail")
	 *
	 * @param {"success" | "fail"} filter
	 *
	 * @returns {number | object}
	 *
	 **/
	getAggregratedValue(filter) {
		if (filter == "success" || filter == "fail")
			return this.aggregate(filter);
		return {
			aggregatedValue: this.aggregatedValue,
			success: this.aggregate("success"),
			fail: this.aggregate("fail"),
		};
	}

	/**
	 * Updates aggregatedValue in instance.
	 * Takes value from params and add it to aggregatedValue if remove param is not set to true, else remove the value from it.
	 * Usually remove will be set if after stale timeout of invalid transaction/message.
	 *
	 * @param {number} value
	 * @param {boolean} remove
	 *
	 **/
	updateAggregatedValue(value, remove = false) {
		if (remove) this.aggregatedValue = this.aggregatedValue - value;
		else this.aggregatedValue = this.aggregatedValue + value;
	}

	/**
	 * Takes message object and isValid as params and returns a formatted object to add in messages list.
	 *
	 *
	 * @param {object} msgObj
	 * @param {boolean} isValid
	 *
	 * @returns {object} {address, value, isValid }
	 *
	 **/
	formatMessage(msgObj, isValid) {
		return {
			address: msgObj.address,
			value: msgObj.value,
			isValid,
		};
	}

	/**
	 * Takes message object as param. Add the value from message immediately to aggregatedValue in instance.
	 * Performs the validation of the signature( by recovering account address from signature ) in message object.
	 * If message is validated, will add the formatted message to the list in instance, else
	 * will set the isValid to false and add the formatted message to the list in instance.
	 * And After configured(through .env) stale timeout, the value will be removed from the aggregated value in instance.
	 *
	 * @param {object} msgObj
	 *
	 **/
	async addMessage(msgObj) {
		const self = this;
		self.updateAggregatedValue(msgObj.value);
		addLog(
			"Received Value:" +
				msgObj.value +
				"\naggregatedValue: " +
				this.aggregatedValue,
			"addMessage"
		);
		const isValid = await isValidTransaction(msgObj);
		this.messagesFromClients.push(this.formatMessage(msgObj, isValid));
		if (!isValid) {
			setTimeout(() => {
				self.updateAggregatedValue(msgObj.value, true);
				addLog(
					`Transaction failed to report, removing stale value \x1b[31m${msgObj.value}\x1b[0m from aggregated Value`,
					"removeFromAggregration"
				);
				addLog(
					"aggregatedValue: " + this.aggregatedValue,
					"removeFromAggregration"
				);
			}, process.env.INVALID_VALUE_STALE_TIMEOUT || 5000);
		}
		Promise.resolve();
	}

	/**
	 * Will reset the instance values to init state
	 *
	 **/
	reset() {
		this.aggregatedValue = 0;
		this.messagesFromClients = [];
	}
}

module.exports = {
	MetricAggregator,
};
