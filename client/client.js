const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
	getWeb3Instance,
	postTransactionToServer,
	initClientToServerMessagesPolling,
	getAccounts,
	addMessage,
} = require("./client.service");
const { addLog } = require("../helper");
const server = require("http").createServer(app);

require("dotenv").config({ path: "../.env" }); // read properties from .env
const port = process.env.CLIENT_PORT || process.env.PORT || 3022;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	res.json(data);
}
// // send a message to server
// app.post("/postMessage", async (req, res) => {
	
// });
// AJ - TODO - add account
// get accounts
app.get("/getAccounts", (req, res) => {
	handleJSONResponse(res, { accounts: getAccounts() });
});
// add Message
app.post("/addMessage", async (req, res) => {
	const {accountKey, value, tamper } = req.body;
	const msgObj = await addMessage(accountKey, value, tamper);
	handleJSONResponse(res, msgObj);
});
initClientToServerMessagesPolling();

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
