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
	getMetricAggregateInstance().addMessage(tx);
};
const getMessages = (filter) => {
	return getMetricAggregateInstance().getMessages(filter);
};
module.exports = {
	getAggregratedValue,
	aggregateMessage,
	getMessages,
};
