function log(type, msg) {
	console.log(`[${(new Date()).toISOString()}][${type}] ${msg}`)
}
module.exports = log
