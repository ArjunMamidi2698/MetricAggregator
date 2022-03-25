const assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../../server/server"); // start server
let clientsServer = require("../../client/client"); // start client
const { getAccountsLengthInWallet } = require("../../utils/web3Utils");
let should = chai.should();
require("dotenv").config({ path: "../../.env" }); // read properties from .env

chai.use(chaiHttp);

describe("ClientsServer to Server", () => {
	describe("Accounts", () => {
		it("Should initAccounts in wallet", () => {
			assert.equal(
				getAccountsLengthInWallet(),
				process.env.ACCOUNTS_LENGTH
			);
		});
	});

	describe("Init state of server", () => {
		it("Should get 0 aggregated value before starting polling", async () => {
			const res = await chai.request(server).get("/aggregatedValue");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.be.a("object");
			res.body.aggregatedValue.should.have.property("aggregatedValue");
			res.body.aggregatedValue.should.have
				.property("aggregatedValue")
				.eql(0);
			res.body.aggregatedValue.should.have.property("success").eql(0);
			res.body.aggregatedValue.should.have.property("fail").eql(0);
		});
		it("Should get 0 messages length before starting polling", async () => {
			const res = await chai.request(server).get("/getMessages");
			res.should.have.status(200);
			res.body.should.be.a("object");
			res.body.should.have.property("length");
			res.body.should.have.property("length").eql(0);
			res.body.should.have.property("messages");
			res.body.should.have.property("messages").eql([]);
		});
	});
	describe("Messages from Random Clients to Server Polling for 6 seconds", () => {
		const MESSAGE_PUBLISH_INTERVAL = process.env.MESSAGE_PUBLISH_INTERVAL;
		beforeEach(function (done) {
			this.timeout(MESSAGE_PUBLISH_INTERVAL + 100);
			setTimeout(done, MESSAGE_PUBLISH_INTERVAL);
		});
		let val = 0;
		for (var i = 0; i < 5; i++) {
			it(`Should call get messages api and get length as ${
				i + 1
			}`, (done) => {
				val += 1; // using val as we are waiting for an interval and tests are iterated before waiting time
				chai.request(server)
					.get("/getMessages")
					.end((err, res) => {
						res.should.have.status(200);
						res.body.should.be.a("object");
						res.body.length.should.be.eql(val);
						done();
					});
			});
		}
	});
});
