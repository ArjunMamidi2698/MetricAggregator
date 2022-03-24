const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
	initClientToServerMessagesPolling,
	getAccounts,
	addMessage,
	initAccounts,
} = require("./client.service");
const { addLog } = require("../helper");
const clientServer = require("http").createServer(app);

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
// middleware to log every route
app.use("/*", function route(req, res, next) {
	addLog(req.baseUrl);
	next();
});

function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	if (data.hasOwnProperty("error")) {
		res.status(201).json(data); // if any error in data, sets status to 201
	} else {
		res.json(data);
	}
}
// get accounts
app.get("/getAccounts", (req, res) => {
	handleJSONResponse(res, { accounts: getAccounts() });
});
// add Message with optional param tamper(true or false)
app.post("/addMessage", async (req, res) => {
	const { accountKey, value, tamper } = req.body; // here accountKey can be account address or position of account in wallet
	const msgObj = await addMessage(accountKey, value, tamper);
	handleJSONResponse(res, msgObj);
});

// create accounts
const accountsLength = process.env.ACCOUNTS_LENGTH || 10;
initAccounts(accountsLength);

// init client to server polling
if (!process.env.ENV_VAR || process.env.ENV_VAR != "test")
	initClientToServerMessagesPolling();

// Server listening
clientServer.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});

module.exports = clientServer;
