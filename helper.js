// logs

function addLog(data) {
	// logFormat: date timestamp - [callerName]: <data>
	console.log(
		"\x1b[33m%s\x1b[0m",
		new Date(),
		" -  [" + "\x1b[36m" + addLog.caller?.name + "\x1b[0m" + "]: " + data
	);
}

module.exports = {
	addLog,
};
