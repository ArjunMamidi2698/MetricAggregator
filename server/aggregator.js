const { addLog } = require("../helper");
const { isValidTransaction } = require("./services/server.service");

class MetricAggregator {
	constructor(aggregatedValue = 0, messagesFromClients = []) {
		this.aggregatedValue = aggregatedValue;
		this.messagesFromClients = messagesFromClients;
	}

	getValidMessages() {
		return this.messagesFromClients.filter(
			(messageObj) => messageObj.isValid
		);
	}

	getInvalidMessages() {
		return this.messagesFromClients.filter(
			(messageObj) => !messageObj.isValid
		);
	}

	getAllMessages() {
		return this.messagesFromClients;
	}

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

	aggregate(filter) {
		return this.getMessages(filter)
			.map((message) => message.value)
			.reduce((partialSum, a) => partialSum + a, 0);
	}

	getAggregratedValue(filter) {
		if (filter == "success" || filter == "fail")
			return this.aggregate(filter);
		return {
			success: this.aggregate("success"),
			fail: this.aggregate("fail"),
		};
	}

	updateAggregatedValue(value, remove = false) {
		if (remove) this.aggregatedValue = this.aggregatedValue - value;
		else this.aggregatedValue = this.aggregatedValue + value;
	}

	formatMessage(msgObj, isValid) {
		return {
			address: msgObj.address,
			value: msgObj.value,
			isValid,
		};
	}
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

	reset() {
		this.aggregatedValue = 0;
		this.messagesFromClients = [];
	}
}

module.exports = {
	MetricAggregator,
};
