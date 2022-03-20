const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
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
// middleware to log every route
app.use("/*", function route(req, res, next) {
	addLog(req.baseUrl);
	next();
});

function handleJSONResponse(res, data) {
	res.setHeader("Content-Type", "application/json");
	app.set("json spaces", 4);
	res.json(data);
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

// init client to server polling
initClientToServerMessagesPolling();

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
