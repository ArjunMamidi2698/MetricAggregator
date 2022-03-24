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
	try {
		return getMetricAggregateInstance().addMessage(tx);
	} catch (error) {
		return { error: error.message };
	}
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
