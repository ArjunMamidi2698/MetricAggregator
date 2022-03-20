// aggregrate logic

const { addLog } = require("../../helper");
const { isValidTransaction } = require("./server.service");

const messagesFromClients = [];
var aggregatedValue = 0;
// [
// 		{
//			address,
// 			value,
// 			status
// 		}
// ]
const getValidMessages = () => {
	return messagesFromClients.filter((messageObj) => messageObj.isValid);
};
const getInvalidMessages = () => {
	return messagesFromClients.filter((messageObj) => !messageObj.isValid);
};
const getAllMessages = () => messagesFromClients;
const getMessages = (filter) => {
	switch (filter) {
		case "success":
			return getValidMessages();
		case "fail":
			return getInvalidMessages();
		default:
			return getAllMessages();
	}
};
const aggregate = (filter) => {
	return getMessages(filter)
		.map((message) => message.value)
		.reduce((partialSum, a) => partialSum + a, 0);
};
const getAggregratedValue = (filter) => {
	if (filter == "success" || filter == "fail") return aggregate(filter);
	return {
		success: aggregate("success"),
		fail: aggregate("fail"),
	};
};
const aggregateMessage = async (tx) => {
	aggregatedValue += tx.value;
	addLog("aggregatedValue: " + aggregatedValue);
	const isValid = await isValidTransaction(tx);
	messagesFromClients.push({
		address: tx.address,
		value: tx.value,
		isValid,
	});
	if (!isValid) {
		aggregatedValue -= tx.value;
		addLog(
			`Transaction failed to report, removing \x1b[31m${tx.value}\x1b[0m from aggregated Value`
		);
		addLog("aggregatedValue: " + aggregatedValue);
	}
};

module.exports = {
	getAggregratedValue,
	aggregateMessage,
	getMessages,
};
