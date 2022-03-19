const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
	getWeb3Instance,
	postTransactionToServer,
} = require("./client.service");
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

getWeb3Instance().eth.getAccounts(async (err, accounts) => {
	const interval = setInterval(() => {
		postTransactionToServer(
			accounts[Math.floor(Math.random() * accounts.length)],
			Math.floor(Math.random() * 10) + 1
		); // AJ - TODO - LIMIT FROM ENV
	}, 1000);
	setTimeout(() => {
		clearInterval(interval);
	}, 30000);
});

// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
