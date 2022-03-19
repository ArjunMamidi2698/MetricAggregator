const express = require("express"); // Importing express module
const app = express(); // new express app
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
require("dotenv").config({ path: "../.env" });
const { getWeb3Instance } = require("./services/server.service");

const port = process.env.SERVER_PORT;
const CircularJSON = require("circular-json");
const { aggregateMessage } = require("./services/aggregator.service");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

// function handleJSONResponse(res, data) {
// 	res.setHeader("Content-Type", "application/json");
// 	app.set("json spaces", 4);
// 	res.json(data);
// }
// routes for the app
app.post("/sendMessage", (req, res) => {
	aggregateMessage(req.body);
	res.send("data received");
	// handleJSONResponse(res, JSON.parse(CircularJSON.stringify(getWeb3Instance())));
});


// Server listening
server.listen(port, () => {
	console.log(`listening at ${port} port!!!!`);
});
