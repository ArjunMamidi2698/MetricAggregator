const SHA256 = require("crypto-js/sha256");

/**
 *
 * Prints data in console with colors and in logFormat => date timestamp - [callerName]: <data>
 * This will skip printing in test environment.
 *
 * @param {string} data
 * @param {string?} functionName
 *
 **/
function addLog(data, functionName) {
	if (!process.env.ENV_VAR || process.env.ENV_VAR != "test") {
		const caller =
			functionName == undefined ? addLog.caller?.name : functionName;
		// logFormat: date timestamp - [callerName]: <data>
		console.log(
			"\x1b[33m%s\x1b[0m",
			new Date(),
			" -  [" + "\x1b[36m" + caller + "\x1b[0m" + "]: " + data
		);
	}
}

/**
 *
 * Validates value and returns parsed integer of value or throws error if any.
 * Value should be a valid and Positive Number( > 0 )
 * @param {any} value
 *
 * @returns {number} parsedValue
 *
 **/
function validateValue(value) {
	if (isNaN(value)) throw new Error("Value should be a valid Number");
	if (parseInt(value) <= 0)
		throw new Error("Value should be Positive Number( > 0 )");
	return parseInt(value);
}

/**
 *
 * Validates range and returns array of parsed min and max values or throws error if any.
 * Min, Max values should be postive valid numbers and min should not be greater than max.
 *
 * @param {any} minValue
 * @param {any} maxValue
 *
 * @returns {[number, number]} [parsedMinValue, parsedMaxValue]
 *
 **/
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

/**
 *
 * Generates a randomValue in the given range.
 * Takes minValue and maxValue as params and return a randomvalue inclusive the range.
 *
 * @param {number} minValue
 * @param {number} maxValue
 *
 * @returns {number}
 *
 **/
function generateRandomValueInRange(minValue, maxValue) {
	return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

/**
 *
 * Takes value and timestamp as params and concat them and generated a hash string with the concated data.
 *
 * @param {number} value
 * @param {number} timestamp
 *
 * @returns {string} hash
 *
 **/
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
