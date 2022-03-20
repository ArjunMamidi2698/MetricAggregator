const SHA256 = require("crypto-js/sha256");

// logs
function addLog(data, functionName) {
	const caller = functionName == undefined ? addLog.caller?.name : functionName;
	// logFormat: date timestamp - [callerName]: <data>
	console.log(
		"\x1b[33m%s\x1b[0m",
		new Date(),
		" -  [" + "\x1b[36m" + caller + "\x1b[0m" + "]: " + data
	);
}

function validateValue(value) {
	if (isNaN(value)) throw new Error("Value should be a valid Number");
	if (parseInt(value) <= 0)
		throw new Error("Value should be Positive Number( > 0 )");
	return parseInt(value);
}
function validateConfiguredRange(minValue, maxValue) {
	if (isNaN(minValue) || isNaN(maxValue)) {
		throw new Error(
			"Values configured for min or max should be a valid Number"
		);
	}
	if (parseInt(minValue) <= 0 || parseInt(maxValue) <= 0) {
		throw new Error(
			"Values configured for min or max should be Positive Number( > 0 )"
		);
	}
	if (parseInt(minValue) > parseInt(maxValue)) {
		throw new Error("minValue should not be greater than maxValue");
	}
	return [parseInt(minValue), parseInt(maxValue)];
}
function generateRandomValueInRange(minValue, maxValue) {
	return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}
function generateTransactionHash(value, timestamp) {
	return SHA256("" + value + timestamp).toString();
}

module.exports = {
	addLog,
	validateValue,
	validateConfiguredRange,
	generateRandomValueInRange,
	generateTransactionHash,
};
