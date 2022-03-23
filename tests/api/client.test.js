let chai = require("chai");
let chaiHttp = require("chai-http");
let clientServer = require("../../client/client");
const { findAccount } = require("../../web3Utils");
let should = chai.should();
require("dotenv").config({ path: "../../.env" }); // read properties from .env

chai.use(chaiHttp);
describe("Client GET Api", () => {
	describe("GET api to fetch all Accounts details in wallet", () => {
		it("Should fetch all configured length of accounts added into the wallet", async () => {
			const res = await chai.request(clientServer).get("/getAccounts");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("accounts");
			res.body.accounts.length.should.eql(
				parseInt(process.env.ACCOUNTS_LENGTH)
			);
		});
	});
});

describe("Client POST Api", () => {
	describe("POST api to add a message to server", () => {
		it("Should add message if correct params are sent", async () => {
			const accountIndex = 0;
			const value = 10;
			const account = await findAccount(accountIndex);
			const res = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({ accountKey: accountIndex, value: value });
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("timestamp");
			res.body.should.have.property("address");
			res.body.should.have.property("value");
			res.body.should.have.property("signature");
			res.body.should.have.property("value").eql(value);
			res.body.should.have.property("address").eql(account.address);
		});
		it("Should add message if tamper param is set true", async () => {
			const accountIndex = 0;
			const value = 10;
			const account = await findAccount(accountIndex);
			const res = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({ accountKey: accountIndex, value: value, tamper: true });
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("timestamp");
			res.body.should.have.property("address");
			res.body.should.have.property("value");
			res.body.should.have.property("signature");
			res.body.should.have.property("value").eql(value);
			res.body.should.have.property("address").eql(account.address);
		});
		it("Should fail if value is not a valid positive number", async () => {
			const res = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({ accountKey: 0, value: -1 });
			res.should.have.status(201);
			res.body.should.have.property("error");
			const res2 = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({ accountKey: 0, value: "!234$" });
			res2.should.have.status(201);
			res2.body.should.have.property("error");
		});
		it("Should fail if account not found", async () => {
			const res = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({ accountKey: 120, value: 10 });
			res.should.have.status(201);
			res.body.should.have.property("error");
			const res2 = await chai
				.request(clientServer)
				.post("/addMessage")
				.send({
					accountKey:
						"0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655",
					value: 10,
				});
			res2.should.have.status(201);
			res2.body.should.have.property("error");
		});
	});
});
// describe("Server Post API to add Message", () => {
// it("Should add MessageObject", (done) => {
// 	const txObj = generateTransactionObject(account1, 100);
// 	txObj.then((txRes) => {
// 		chai.request(clientServer)
// 			.post("/sendMessage")
// 			.send(txRes)
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				res.body.should.be.a("object");
// 				res.body.should.have.property("message");
// 				res.body.should.have
// 					.property("message")
// 					.eql("data Received");
// 			});
// 		chai.request(clientServer)
// 			.get("/getMessages")
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				res.body.should.be.a("object");
// 				res.body.should.have.property("length");
// 				res.body.should.have.property("aggregatedValue");
// 				res.body.should.have.property("messages");
// 				res.body.length.should.be.a("number");
// 				res.body.should.have.property("length").eql(1);
// 				done();
// 			});
// 	});
// });
// it("Should add Tampered MessageObject with fail status", (done) => {
// 	const txObj = generateTransactionObject(account2, 100);
// 	txObj.then((txRes) => {
// 		txRes.value += 1; // tampering value before posting to clientServer
// 		chai.request(clientServer)
// 			.post("/sendMessage")
// 			.send(txRes)
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				res.body.should.be.a("object");
// 				res.body.should.have.property("message");
// 				res.body.should.have
// 					.property("message")
// 					.eql("data Received");
// 			});
// 		chai.request(clientServer)
// 			.get("/getMessages")
// 			.end((err, res) => {
// 				res.should.have.status(200);
// 				res.body.should.be.a("object");
// 				res.body.should.have.property("length");
// 				res.body.should.have.property("aggregatedValue");
// 				res.body.should.have.property("messages");
// 				res.body.length.should.be.a("number");
// 				res.body.should.have.property("length").eql(2);
// 				res.body.messages[1].should.be.a("object");
// 				res.body.messages[1].should.have.property("isValid");
// 				res.body.messages[1].should.have
// 					.property("isValid")
// 					.eql(false);
// 				done();
// 			});
// 	});
// });
// });

// describe("Server Get API's", () => {
// 	describe("get AggregatedValue", () => {
// 		it("should get correct response of aggregated value for both success and fail", (done) => {
// 			chai.request(clientServer)
// 				.get("/aggregatedValue")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("object");
// 					res.body.aggregatedValue.should.have.property("success");
// 					res.body.aggregatedValue.should.have.property("fail");
// 					res.body.aggregatedValue.should.have
// 						.property("success")
// 						.eql(100);
// 					res.body.aggregatedValue.should.have
// 						.property("fail")
// 						.eql(101);
// 					done();
// 				});
// 		});
// 		it("should get correct response of aggregated value for success filter", (done) => {
// 			chai.request(clientServer)
// 				.get("/aggregatedValue?filter=success")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("number");
// 					res.body.should.have.property("aggregatedValue").eql(100);
// 					done();
// 				});
// 		});
// 		it("should get correct response of aggregated value for fail filter", (done) => {
// 			chai.request(clientServer)
// 				.get("/aggregatedValue?filter=fail")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("number");
// 					res.body.should.have.property("aggregatedValue").eql(101);
// 					done();
// 				});
// 		});
// 	});
// 	describe("get Messages", () => {
// 		it("should get correct response of messages from clients for both success and fail", (done) => {
// 			chai.request(clientServer)
// 				.get("/getMessages")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("length");
// 					res.body.length.should.be.a("number");
// 					res.body.should.have.property("length").eql(2);
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("object");
// 					res.body.should.have
// 						.property("aggregatedValue")
// 						.eql({ success: 100, fail: 101 });
// 					res.body.should.have.property("messages");
// 					res.body.should.have.property("messages").eql([
// 						{
// 							address: account1.address,
// 							value: 100,
// 							isValid: true,
// 						},
// 						{
// 							address: account2.address,
// 							value: 101,
// 							isValid: false,
// 						},
// 					]);
// 					done();
// 				});
// 		});
// 		it("should get correct response of messages from clients for success filter", (done) => {
// 			chai.request(clientServer)
// 				.get("/getMessages?filter=success")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("length");
// 					res.body.length.should.be.a("number");
// 					res.body.should.have.property("length").eql(1);
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("number");
// 					res.body.should.have.property("aggregatedValue").eql(100);
// 					res.body.should.have.property("messages");
// 					res.body.should.have.property("messages").eql([
// 						{
// 							address: account1.address,
// 							value: 100,
// 							isValid: true,
// 						},
// 					]);
// 					done();
// 				});
// 		});
// 		it("should get correct response of messages from clients for fail filter", (done) => {
// 			chai.request(clientServer)
// 				.get("/getMessages?filter=fail")
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a("object");
// 					res.body.should.have.property("length");
// 					res.body.length.should.be.a("number");
// 					res.body.should.have.property("length").eql(1);
// 					res.body.should.have.property("aggregatedValue");
// 					res.body.aggregatedValue.should.be.a("number");
// 					res.body.should.have.property("aggregatedValue").eql(101);
// 					res.body.should.have.property("messages");
// 					res.body.should.have.property("messages").eql([
// 						{
// 							address: account2.address,
// 							value: 101,
// 							isValid: false,
// 						},
// 					]);
// 					done();
// 				});
// 		});
// 	});
// });
