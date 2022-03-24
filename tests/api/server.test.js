let chai = require("chai");
let chaiHttp = require("chai-http");
const { generateTransactionObject } = require("../../client/client.service");
let server = require("../../server/server");
const {
	getMetricAggregateInstance,
} = require("../../server/services/aggregator.service");
const { findAccount, createAccounts } = require("../../web3Utils");
let should = chai.should();

chai.use(chaiHttp);

describe("Server POST API", () => {
	describe("add Message", () => {
		it("Should add MessageObject", async () => {
			getMetricAggregateInstance().reset();
			createAccounts(2);
			const account = findAccount(0);
			const txObj = await generateTransactionObject(account, 100);
			const res = await chai
				.request(server)
				.post("/sendMessage")
				.send(txObj);
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("message");
			res.body.should.have.property("message").eql("data Received");
			const messagesRes = await chai.request(server).get("/getMessages");
			messagesRes.should.have.status(200);
			messagesRes.body.should.be.a("object");
			messagesRes.body.should.have.property("length");
			messagesRes.body.should.have.property("aggregatedValue");
			messagesRes.body.should.have.property("messages");
			messagesRes.body.length.should.be.a("number");
			messagesRes.body.should.have.property("length").eql(1);
		});
		it("Should add Tampered MessageObject with fail status", async () => {
			const account = findAccount(1);
			const txObj = await generateTransactionObject(account, 100);
			txObj.value += 1; // tampering value before posting to server
			const res = await chai
				.request(server)
				.post("/sendMessage")
				.send(txObj);
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("message");
			res.body.should.have.property("message").eql("data Received");
			const messagesRes = await chai.request(server).get("/getMessages");
			messagesRes.should.have.status(200);
			messagesRes.body.should.be.a("object");
			messagesRes.body.should.have.property("length");
			messagesRes.body.should.have.property("aggregatedValue");
			messagesRes.body.should.have.property("messages");
			messagesRes.body.length.should.be.a("number");
			messagesRes.body.should.have.property("length").eql(2);
			messagesRes.body.messages[1].should.be.a("object");
			messagesRes.body.messages[1].should.have.property("isValid");
			messagesRes.body.messages[1].should.have
				.property("isValid")
				.eql(false);
		});
	});
});

describe("Server GET API's", () => {
	describe("get AggregatedValue", () => {
		it("should get correct response of aggregated value for both success and fail", async () => {
			const res = await chai.request(server).get("/aggregatedValue");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("object");
			res.body.aggregatedValue.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.have.property("success");
			res.body.aggregatedValue.should.have.property("fail");
			res.body.aggregatedValue.should.have.property("aggregatedValue").eql(201); // will remove failed valie after stale timeout
			res.body.aggregatedValue.should.have.property("success").eql(100);
			res.body.aggregatedValue.should.have.property("fail").eql(101);
		});
		it("should get correct response of aggregated value for success filter", async () => {
			const res = await chai
				.request(server)
				.get("/aggregatedValue?filter=success");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("number");
			res.body.should.have.property("aggregatedValue").eql(100);
		});
		it("should get correct response of aggregated value for fail filter", async () => {
			const res = await chai
				.request(server)
				.get("/aggregatedValue?filter=fail");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("number");
			res.body.should.have.property("aggregatedValue").eql(101);
		});
	});
	describe("get Messages", () => {
		it("should get correct response of messages from clients for both success and fail", async () => {
			const res = await chai.request(server).get("/getMessages");
			const account1 = findAccount(0);
			const account2 = findAccount(1);
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("length");
			res.body.length.should.be.a("number");
			res.body.should.have.property("length").eql(2);
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("object");
			res.body.should.have
				.property("aggregatedValue")
				.eql({ aggregatedValue: 201, success: 100, fail: 101 });
			res.body.should.have.property("messages");
			res.body.should.have.property("messages").eql([
				{
					address: account1.address,
					value: 100,
					isValid: true,
				},
				{
					address: account2.address,
					value: 101,
					isValid: false,
				},
			]);
		});
		it("should get correct response of messages from clients for success filter", async () => {
			const res = await chai
				.request(server)
				.get("/getMessages?filter=success");
			const account1 = findAccount(0);
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("length");
			res.body.length.should.be.a("number");
			res.body.should.have.property("length").eql(1);
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("number");
			res.body.should.have.property("aggregatedValue").eql(100);
			res.body.should.have.property("messages");
			res.body.should.have.property("messages").eql([
				{
					address: account1.address,
					value: 100,
					isValid: true,
				},
			]);
		});
		it("should get correct response of messages from clients for fail filter", async () => {
			const res = await chai
				.request(server)
				.get("/getMessages?filter=fail");
			const account2 = findAccount(1);
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("length");
			res.body.length.should.be.a("number");
			res.body.should.have.property("length").eql(1);
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("number");
			res.body.should.have.property("aggregatedValue").eql(101);
			res.body.should.have.property("messages");
			res.body.should.have.property("messages").eql([
				{
					address: account2.address,
					value: 101,
					isValid: false,
				},
			]);
		});
	});
});
