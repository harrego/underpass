const v3 = require("node-hue-api").v3,
      discovery = v3.discovery,
      hueApi = v3.api
      
const log = require("./log")
const csv = require("./csv")
      
const fs = require("fs").promises
const path = require("path")
      
const appName = "underpass"
const deviceName = "website"

const credentialsFileName = "credentials.csv"

async function discoverBridge() {
	const discoveryResults = await discovery.nupnpSearch()
	
	if (discoveryResults.length === 0) {
		console.log("[warning] failed to find any bridges")
		return null;
	} else {
		return discoveryResults[0].ipaddress
	}
}
exports.discoverBridge = discoverBridge

async function bridgeAuth(ipAddress) {
	const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect()
	
	// auth and create a user
	let createdUser
	try {
		createdUser = await unauthenticatedApi.users.createUser(appName, deviceName)
		
		log("status", `bridge user: ${createdUser.username}`)
		log("status", `bridge user client key: ${createdUser.clientkey}`)
		
		const csvCredentials = `HueBridgeUser,HueBridgeUserClientKey\n${createdUser.username},${createdUser.clientkey}`
		await fs.writeFile(credentialsFileName, csvCredentials)
		log("status", `saved credentials to ${credentialsFileName}`)
		
		return createdUser
	} catch (err) {
		if (err.getHueErrorType() == 101) {
			log("error", "link button was not pressed")
		} else {
			log("log", `"${err.message}"`)
		}
	}
}

async function readCsv() {
	try {
		const csvBuf = await fs.readFile(credentialsFileName)
		const csvData = csv.read(csvBuf.toString())
		
		const userCol = csvData["HueBridgeUser"]
		let username = undefined
		if (userCol && userCol.length > 0) {
			username = userCol[0]
		}
		
		const keyCol = csvData["HueBridgeUserClientKey"]
		let key = undefined
		if (keyCol && keyCol.length > 0) {
			key = keyCol[0]
		}
		
		return { username: username, clientkey: key }
	} catch (e) {
		return {}
	}
}
exports.readCsv = readCsv

/**
 * Discover and authenticate with the Hue Bridge on the network. Requires you to press the link button on the bridge before calling.
 *
 * Will write credentials to `credentials.csv` for future use.
 *
 * @async
 * @function auth
 * @return {Promise<object>} Object with `username` and `clientkey`. `null` if authentication or discovery failed. 
 */
async function discoveryAuth() {
	const ipAddress = await discoverBridge()
	if (ipAddress != null) {
		return await bridgeAuth(ipAddress)
	} else {
		log("error", "failed to get bridge ip address")
		return null
	}
}
exports.discoveryAuth = discoveryAuth
