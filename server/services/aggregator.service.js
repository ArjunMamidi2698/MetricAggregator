// aggregrate logic

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
const aggregateMessage = async (tx) => {
	aggregatedValue += tx.value;
	console.log("aggregatedValue: ", aggregatedValue);
	const isValid = await isValidTransaction(tx);
	messagesFromClients.push({
		address: tx.address,
		value: tx.value,
		isValid,
	});
	if (!isValid) {
		aggregatedValue -= tx.value;
		console.log("invalid transaction");
		console.log("aggregatedValue: ", aggregatedValue);
	}
};

module.exports = {
	aggregatedValue,
	aggregateMessage,
	getValidMessages,
	getInvalidMessages,
	getAllMessages,
};
