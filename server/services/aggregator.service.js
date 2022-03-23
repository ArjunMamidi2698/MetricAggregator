const { MetricAggregator } = require("../aggregator");

let metricAggregatorInstance = null; // cache
const getMetricAggregateInstance = () => {
	if (metricAggregatorInstance != null) return metricAggregatorInstance;
	return (metricAggregatorInstance = new MetricAggregator(0, []));
};

const getAggregratedValue = (filter) => {
	return getMetricAggregateInstance().getAggregratedValue(filter);
};
const aggregateMessage = (tx) => {
	// AJ - TODO - ERROR HANDLING
	getMetricAggregateInstance().addMessage(tx);
};
const getMessages = (filter) => {
	return getMetricAggregateInstance().getMessages(filter);
};
module.exports = {
	getMetricAggregateInstance,
	getAggregratedValue,
	aggregateMessage,
	getMessages,
};
