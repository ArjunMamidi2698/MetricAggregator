const assert = require("assert");
const {
	validateValue,
	validateConfiguredRange,
	generateTransactionHash,
} = require("../utils/serviceUtils");

describe("Helpers", () => {
	describe("Validations", () => {
		describe("Value in Message", () => {
			it("Should return parsed Int Value", () => {
				assert.equal(validateValue(500), 500);
				assert.equal(validateValue("500"), 500);
				assert.equal(validateValue(" 500"), 500);
				assert.equal(validateValue("  500  "), 500);
				assert.equal(validateValue(500.2), 500);
				assert.equal(validateValue("  500.2  "), 500);
			});
			it("Should throw error if input given is not a number", () => {
				assert.throws(
					() => validateValue("i'm not a number"),
					Error,
					"Value should be a valid Number"
				);
				assert.throws(
					() => validateValue("  i'm not a number with spaces "),
					Error,
					"Value should be a valid Number"
				);
				assert.throws(
					() => validateValue("1234$67&"),
					Error,
					"Value should be a valid Number"
				);
				assert.doesNotThrow(() => validateValue(100), Error);
			});
			it("Should throw error if input given is not a positive number", () => {
				assert.throws(() => validateValue(0), Error);
				assert.throws(() => validateValue(-1), Error);
				assert.doesNotThrow(() => validateValue(1), Error);
			});
		});
		describe("Configured Range for value", () => {
			it("Should return Array with parsed min and max values of a range", () => {
				assert.deepEqual(validateConfiguredRange(1, 2), [1, 2]);
				assert.deepEqual(validateConfiguredRange("1", "2"), [1, 2]);
				assert.deepEqual(validateConfiguredRange(" 1 ", " 2 "), [1, 2]);
				assert.deepEqual(validateConfiguredRange(1.0, 2.0), [1, 2]);
			});
			it("Should throw error if any of min and max values of a range is not a valid positive number", () => {
				assert.doesNotThrow(() => validateConfiguredRange(1, 2), Error);
				assert.throws(() => validateConfiguredRange(-1, 2), Error);
				assert.throws(() => validateConfiguredRange(1, -2), Error);
				assert.throws(() => validateConfiguredRange(-1, -2), Error);
				assert.throws(
					() => validateConfiguredRange("min", "max"),
					Error
				);
				assert.throws(
					() => validateConfiguredRange("m!n", "m^x"),
					Error
				);
			});
			it("Should throw error if min greater than max value of a range", () => {
				assert.doesNotThrow(() => validateConfiguredRange(1, 2), Error);
				assert.throws(() => validateConfiguredRange(20, 2), Error);
				assert.throws(() => validateConfiguredRange(20.5, 2.5), Error);
			});
		});
	});
	describe("Generate Hash", () => {
		it("Should generate Correct hash", () => {
			assert.equal(
				generateTransactionHash(10, 1),
				"16dc368a89b428b2485484313ba67a3912ca03f2b2b42429174a4f8b3dc84e44"
			);
			assert.equal(
				generateTransactionHash(100, 1),
				"fe675fe7aaee830b6fed09b64e034f84dcbdaeb429d9cccd4ebb90e15af8dd71"
			);
			assert.notEqual(
				generateTransactionHash(1, 100),
				"fe675fe7aaee830b6fed09b64e034f84dcbdaeb429d9cccd4ebb90e15af8dd71"
			);
		});
	});
});
