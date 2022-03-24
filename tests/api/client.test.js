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
