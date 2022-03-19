const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
	getWeb3Instance,
	postTransactionToServer,
	initClientToServerMessagesPolling,
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

// // send a message to server
// app.post("/postMessage", async (req, res) => {
	
// });

initClientToServerMessagesPolling();

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
