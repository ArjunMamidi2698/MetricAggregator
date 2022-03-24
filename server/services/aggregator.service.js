const { MetricAggregator } = require("../aggregator");

let metricAggregatorInstance = null; // cache
/**
 * Returns an instance of MetricAggregator class.
 * If not found from cache, creates a new instance and assign to the cached variable
 * and return the instance else returns the already created and stored instance.
 *
 * @returns {MetricAggregator}
 *
 **/
const getMetricAggregateInstance = () => {
	if (metricAggregatorInstance != null) return metricAggregatorInstance;
	return (metricAggregatorInstance = new MetricAggregator(0, []));
};

/**
 * Takes filter as param and returns the result from getAggregratedValue(filter) in metricAggregatorInstance.
 *
 * @param {"success" | "fail"} filter
 *
 * @returns {number | object}
 *
 **/
const getAggregratedValue = (filter) => {
	return getMetricAggregateInstance().getAggregratedValue(filter);
};

/**
 * Takes message object from client as param and returns the result from addMessage(filter) in metricAggregatorInstance.
 * Returns error if any
 * @param {object} msgObj
 *
 **/
const aggregateMessage = async (tx) => {
	try {
		return await getMetricAggregateInstance().addMessage(tx);
	} catch (error) {
		return { error: error.message };
	}
};

/**
 * Takes filter as param and returns the result from getMessages(filter) in metricAggregatorInstance.
 *
 * @param {"success" | "fail"} filter
 *
 * @returns {Array}
 *
 **/
const getMessages = (filter) => {
	return getMetricAggregateInstance().getMessages(filter);
};

module.exports = {
	getMetricAggregateInstance,
	getAggregratedValue,
	aggregateMessage,
	getMessages,
};
