# MetricAggregator

Servive to aggregate periodically or manually through api received metrics and to expose api's to fetch metric values

## Prerequisites

### Node

-   #### Ubuntu installation of Node

    You can install nodejs and npm easily with apt install, just run the following commands.

        $ sudo apt install nodejs
        $ sudo apt install npm

-   #### Other Operating Systems
    You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v12.10.0

    $ npm --version
    6.12.0

### Infura account( optional if ganache is used )

-   Create an account in [infura](https://infura.io/)
-   Create a project and set required configurations
-   Select required network and copy https endpoint
-   Use Provider URL in .env file for key `PROVIDER_URL`

## Concepts involved

-   MultiClient - Server Architecture
-   Web3
-   Create Accounts in Etherium Wallet
-   Generate Hash using `crypto-js`
-   Sign MessageHash using web3 instance
-   Periodically send messages from client to server
-   Send message from client through api
-   Validate signature by Recovering account address from signed message
-   Aggregrate value
-   Remove value from invalid Transactions
-	Fetch metrics from server through api

## Steps to run

### Clone application

```
$ git clone https://github.com/ArjunMamidi2698/metricAggregator.git

$ cd metricAggregator
```

### .env file

-   After above steps see .env file in this path `metricAggregator/.env` and update values if required

```
	SERVER_PORT=<port> # server listents to this port
	CLIENT_PORT==<port> # client listents to this port

	PROVIDER_URL=<provider url> # provider endpoint from infura or local RPC endpoint from ganache

	ACCOUNTS_LENGTH=<accountsLength> # accountsLength to be created and atleast 1
	MESSAGE_PUBLISH_INTERVAL=<interval milliseconds> # publish interval to send messages
	MESSAGE_VALUE_RANGE_MIN=<min value> # atleast 1 and not greater than max
	MESSAGE_VALUE_RANGE_MAX=<max value>

```

### Install packages and Start application

```
$ npm i
```

#### Ganache ( optional, but if using update PROVIDER_URL in .env )

```
$ npm run ganache
```

#### Start Server ( run in new terminal tab )

```
$ npm run server

For devlopement
$ npm run server:dev
```

#### Start Client ( run in new terminal tab )

```
$ npm run client

For devlopement
$ npm run client:dev
```

## Api's exposed:

### Server

server port in the .env file should match the curl request port

```
	- curl http://localhost:2022/aggregatedValue
		- retrieves aggregatedValue object for valid and invalid messages
	- curl http://localhost:2022/aggregatedValue?filter=success
		- retrieves aggregatedValue value valid messages
	- curl http://localhost:2022/aggregatedValue?filter=fail
		- retrieves aggregatedValue value invalid messages

	- curl http://localhost:2022/getMessages
		- retrieves all messages sent from multiple clients to server
	- curl http://localhost:2022/getMessages?filter=success
		- retrieves valid messages sent from multiple clients to server
	- curl http://localhost:2022/getMessages?filter=fail
		- retrieves invalid( signature not validated ) messages sent from multiple clients to server

```

### Client

client port in the .env file should match the curl request port

```
	- curl http://localhost:3022/getAccounts
		- retrieves all accounts created in wallet.
	- curl --location --request POST 'http://localhost:3022/addMessage' \
		--header 'Content-Type: application/json' \
		--data-raw '{
			"accountKey": <account address or index>,
			"value": <number atleast 1>
		}'
		- generates and returns a transaction object and submits to server
	- curl --location --request POST 'http://localhost:3022/addMessage' \
		--header 'Content-Type: application/json' \
		--data-raw '{
			"accountKey": <account address or index>,
			"value": <number atleast 1>,
			"tamper": true
		}'
		- generates and returns a transaction object which is intentionally tampered and submits to server


```

## Postman Collection

https://www.getpostman.com/collections/1a87bd76f15ded3910b6

## Demo Video

Watch Demo video here => /metricAggregator/metricAggregator.mp4
